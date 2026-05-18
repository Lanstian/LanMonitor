/* ═══════════════════════════════════════════════════════════════════
   LanMonitor · ASCII 显示补丁
   ─────────────────────────────────────────────────────────────────
   功能:在原版「接收 HEX 显示」/「发送 HEX 显示」之外,新增独立的
        「接收 ASCII 显示」/「发送 ASCII 显示」选项,可与 HEX 并存。

   安装:把本文件与 index.html 放在同一目录,然后在 HTML 的
        </body> 前加一行:
            <script src="lanmonitor-ascii-patch.js"></script>

   作者:LanMonitor 扩展 · 2026
═══════════════════════════════════════════════════════════════════ */

(function attachAsciiPatch(){
  'use strict';

  // 等所有原版脚本执行完(包括 init IIFE)
  function whenReady(fn){
    if(document.readyState === 'complete' || document.readyState === 'interactive'){
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  whenReady(function(){
    // ── 兼容性检查:确认运行在 LanMonitor 环境 ──
    if(typeof window.O !== 'object' || typeof window.processIncoming !== 'function'){
      console.warn('[ASCII Patch] 未检测到 LanMonitor 运行环境,补丁未应用。');
      return;
    }

    /* ════════ ① 给 O 对象注入两个新选项 ════════ */
    if(typeof window.O.rxAscii === 'undefined') window.O.rxAscii = false;
    if(typeof window.O.txAscii === 'undefined') window.O.txAscii = false;


    /* ════════ ② 字节/字符串 → 可读 ASCII 表示 ════════
       可打印字符(0x20~0x7E)原样;\n \r \t 转义;其余显示为 ·       */
    function toAsciiView(input){
      let bytes;
      if(typeof input === 'string'){
        bytes = new TextEncoder().encode(input);
      } else if(input instanceof Uint8Array){
        bytes = input;
      } else if(input instanceof ArrayBuffer){
        bytes = new Uint8Array(input);
      } else {
        bytes = new Uint8Array(input || []);
      }
      let s = '';
      for(const b of bytes){
        if(b >= 0x20 && b <= 0x7E)      s += String.fromCharCode(b);
        else if(b === 0x0A)             s += '\\n';
        else if(b === 0x0D)             s += '\\r';
        else if(b === 0x09)             s += '\\t';
        else                            s += '·';
      }
      return s;
    }
    window.toAsciiView = toAsciiView;     // 暴露给控制台调试


    /* ════════ ③ 在「显示选项」下拉菜单中插入两个 checkbox ════════ */
    function injectMenuItems(){
      const panel = document.getElementById('dd-main-panel');
      if(!panel) return;
      // 已注入则跳过
      if(panel.querySelector('#o-rxascii')) return;

      const rxHexItem = panel.querySelector('#o-rxhex')?.closest('.dd-item');
      const txHexItem = panel.querySelector('#o-txhex')?.closest('.dd-item');

      const makeItem = (id, key, label) => {
        const lbl = document.createElement('label');
        lbl.className = 'dd-item';
        lbl.innerHTML =
          `<input type="checkbox" id="${id}"/>` +
          ` <span>${label}</span>`;
        const cb = lbl.querySelector('input');
        cb.checked = !!window.O[key];
        cb.addEventListener('change', e => {
          window.O[key] = e.target.checked;
          try { window.saveSettings && window.saveSettings(); } catch{}
        });
        return lbl;
      };

      if(rxHexItem){
        const it = makeItem('o-rxascii', 'rxAscii', '接收 ASCII 显示');
        rxHexItem.parentNode.insertBefore(it, rxHexItem.nextSibling);
      }
      if(txHexItem){
        const it = makeItem('o-txascii', 'txAscii', '发送 ASCII 显示');
        txHexItem.parentNode.insertBefore(it, txHexItem.nextSibling);
      }
    }
    injectMenuItems();


    /* ════════ ④ 重写 processIncoming —— 接收侧附加 ASCII 视图 ════════
       注意:原版 processIncoming 已被 v4 在文件末尾覆盖过;
       这里通过保存当前引用 + 重新构造,在 RX 行输出处加 ASCII 列。  */
    const _origProcessIncoming = window.processIncoming;

    window.processIncoming = function(bytes){
      // ── 复刻原版的统计 + 帧解析逻辑 ──
      const now = performance.now();
      try {
        if(typeof frameTimestamps !== 'undefined'){
          frameTimestamps.push(now);
          const cutoff = now - 1000;
          while(frameTimestamps.length && frameTimestamps[0] < cutoff) frameTimestamps.shift();
        }
      } catch{}
      try {
        if(typeof frameCount !== 'undefined'){ /* eslint-disable-next-line */ }
      } catch{}
      // FPS 显示更新交还给原版(若不可用就跳过)
      const fpsEl = document.getElementById('sb-fps');
      if(fpsEl && typeof frameTimestamps !== 'undefined'){
        fpsEl.textContent = `${frameTimestamps.length}/s`;
      }

      // 二进制帧解析(走原版 parseBinaryFrames,保持帧格式编辑器联动)
      if(window.O.frameParser && typeof window.parseBinaryFrames === 'function'){
        try { window.parseBinaryFrames(bytes); } catch(e){}
      }

      // ── 按行解析 ASCII 文本 ──
      // rxBuf 是原版的全局变量,直接复用
      window.rxBuf = (window.rxBuf || '') + new TextDecoder().decode(bytes);
      const lines = window.rxBuf.split('\n');
      window.rxBuf = lines.pop();

      for(let line of lines){
        line = line.trim();
        if(!line) continue;

        // 与原版一致:跳过被帧解析器消化的二进制帧(头两字节 AA 55)
        const isBinaryFrame =
          window.O.frameParser &&
          line.length >= 2 &&
          line.charCodeAt(0) === 0xAA &&
          line.charCodeAt(1) === 0x55;
        if(isBinaryFrame) continue;

        // ── 拼装显示内容 ──
        let display = line;
        let useHex  = false;
        const bytesArr = new TextEncoder().encode(line);

        if(window.O.rxHex){
          const h = Array.from(bytesArr)
            .map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
          display += `  [${h}]`;
          useHex = true;
        }
        if(window.O.rxAscii){
          display += `  <"${toAsciiView(bytesArr)}">`;
          useHex = true;     // 沿用 hex 行的紫色高亮样式
        }

        if(typeof window.addLog === 'function'){
          window.addLog('rx', display, useHex ? 'hex' : null);
        }
        if(typeof window.parseResp === 'function'){
          try { window.parseResp(line); } catch(e){}
        }
      }
    };


    /* ════════ ⑤ 重写 sendRaw —— 发送侧附加 ASCII 视图 ════════
       v4 已把 sendRaw 替换为一个支持多目的(BLE/UART)的实现;
       本补丁再包一层,改写"显示"部分,不动"发送"逻辑。           */
    const _v4SendRaw = window.sendRaw;

    window.sendRaw = async function(cmd, silent){
      // 决定路由目标(复刻 v4 sendRaw 的路由判断,保持显示与实际一致)
      const ble  = window.ble  || {};
      const uart = window.uart || {};
      const t = window.O.sendTarget || 'auto';
      const targets = [];
      if(t === 'all'){
        if(ble.conn)  targets.push('ble');
        if(uart.conn) targets.push('uart');
      } else if(t === 'ble' && ble.conn){
        targets.push('ble');
      } else if(t === 'uart' && uart.conn){
        targets.push('uart');
      } else {
        if(ble.conn && uart.conn){
          targets.push(window.activeTransport || 'ble');
        } else if(ble.conn){
          targets.push('ble');
        } else if(uart.conn){
          targets.push('uart');
        }
      }

      if(!targets.length){
        if(!silent){
          try { window.toast && window.toast('请先连接设备', 'warn'); } catch{}
        }
        return false;
      }

      // 构造 payload(与 v4 一致)
      const full = window.O.nl
        ? (cmd.endsWith('\n') ? cmd : cmd + '\n')
        : cmd;
      let payload;
      if(window.O.hexSend){
        const b = full.replace(/\s+/g,'').match(/.{1,2}/g)
          ?.map(h => parseInt(h, 16)) || [];
        payload = new Uint8Array(b);
      } else {
        payload = new TextEncoder().encode(full);
      }

      // 实际发送
      const MTU_LOCAL = 20;
      let allOk = true;
      for(const tgt of targets){
        try {
          if(tgt === 'ble'){
            for(let i = 0; i < payload.length; i += MTU_LOCAL){
              await ble.char.writeValue(payload.slice(i, i + MTU_LOCAL));
            }
          } else {
            await uart.writer.write(payload);
          }
          window.txB = (window.txB || 0) + payload.length;
        } catch(e){
          allOk = false;
          try {
            window.toast && window.toast(`${tgt.toUpperCase()} 发送失败: ${e.message}`, 'err');
            window.addLog && window.addLog('sys', `${tgt.toUpperCase()} 发送失败: ${e.message}`, 'err');
          } catch{}
        }

        // ── 显示部分:HEX 与 ASCII 视图组合 ──
        if(!silent){
          const ts = full.trim();
          const showSrc = (ble.conn && uart.conn) ? tgt : null;
          let display = ts;
          let useHex  = false;

          if(window.O.txHex){
            const h = Array.from(payload)
              .map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
            display += `  [${h}]`;
            useHex = true;
          }
          if(window.O.txAscii){
            // HEX 发送 → 从 payload 解码;否则 ts 本身就是文本
            const ascii = window.O.hexSend
              ? toAsciiView(payload)
              : toAsciiView(ts);
            display += `  <"${ascii}">`;
            useHex = true;
          }

          const style = useHex ? 'hex' : null;
          if(showSrc && typeof window._writeLogRow === 'function'){
            window._writeLogRow('tx', display, style, new Date(), showSrc);
          } else if(typeof window.addLog === 'function'){
            window.addLog('tx', display, style);
          }
        }
      }

      try { window.updBytes && window.updBytes(); } catch{}
      return allOk;
    };


    /* ════════ ⑥ 让设置持久化也认得新选项 ════════
       原版在 change 事件里只匹配那一串旧 id,这里追加一个监听:
       两个新 checkbox 任何变动都触发 saveSettings,确保刷新后保留。  */
    document.addEventListener('change', e => {
      if(e.target && (e.target.id === 'o-rxascii' || e.target.id === 'o-txascii')){
        try { window.saveSettings && window.saveSettings(); } catch{}
      }
    });

    // 启动时回读持久化的 O,并把已勾选状态同步到刚插入的 checkbox
    setTimeout(() => {
      const rxCb = document.getElementById('o-rxascii');
      const txCb = document.getElementById('o-txascii');
      if(rxCb) rxCb.checked = !!window.O.rxAscii;
      if(txCb) txCb.checked = !!window.O.txAscii;
    }, 200);


    /* ════════ 完成提示 ════════ */
    try {
      window.addLog && window.addLog('sys', 'ASCII 显示补丁已加载 · 在「显示选项」中开启');
    } catch{}
    console.info('[ASCII Patch] LanMonitor ASCII view loaded ✓');
  });
})();
