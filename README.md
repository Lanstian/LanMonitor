# LanMonitor

<p align="center">
  <strong>基于浏览器的 BLE / UART 嵌入式调试终端</strong>
</p>

<p align="center">
  <img alt="HTML" src="https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=000">
  <img alt="Web Bluetooth" src="https://img.shields.io/badge/WebBluetooth-supported-4285F4?logo=googlechrome&logoColor=white">
  <img alt="Web Serial" src="https://img.shields.io/badge/WebSerial-supported-34A853?logo=googlechrome&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-lightgrey">
</p>

## 简介

**LanMonitor** 是一个运行在 Chrome / Chromium 浏览器中的嵌入式设备调试工具，面向 STM32、ESP32、Arduino、OpenMV、HM-10 BLE 模块、USB-TTL 串口模块等开发场景。

项目采用纯前端实现，无需安装桌面客户端。通过 **Web Bluetooth API** 和 **Web Serial API**，可以直接在浏览器中完成 BLE 连接、UART 串口通信、指令发送、数据接收、协议解析、日志导出和可视化监控。

> 适合课程实验、嵌入式调试、蓝牙串口调试、传感器数据监测、OpenMV / MCU 通信验证等场景。

## 目录

- [功能特性](#功能特性)
- [界面预览](#界面预览)
- [运行环境](#运行环境)
- [快速开始](#快速开始)
- [BLE 使用说明](#ble-使用说明)
- [UART 使用说明](#uart-使用说明)
- [默认指令协议](#默认指令协议)
- [数据可视化](#数据可视化)
- [快捷指令与积木编程](#快捷指令与积木编程)
- [录制与回放](#录制与回放)
- [自定义协议帧](#自定义协议帧)
- [键盘快捷键](#键盘快捷键)
- [项目结构](#项目结构)
- [常见问题](#常见问题)
- [开发说明](#开发说明)
- [License](#license)

## 功能特性

### 连接能力

- 支持 **BLE 蓝牙串口通信**
- 支持 **UART / Web Serial 串口通信**
- 支持 BLE 与 UART 连接状态切换
- 支持自定义 BLE Service UUID 与 Characteristic UUID
- 支持串口参数配置：波特率、数据位、校验位、停止位、流控制

### 终端调试

- 实时 RX / TX 数据显示
- ASCII 与 HEX 双模式显示
- 支持 HEX 发送
- 支持自动追加换行符 `\n`
- 支持时间戳显示
- 支持自动滚动与自动换行
- 支持终端日志搜索
- 支持通信日志导出为 `.txt`

### 指令系统

- 内置常用快捷指令
- 支持单条发送
- 支持批量发送选中指令
- 支持循环发送
- 支持指令延时
- 支持模板变量替换
- 支持可视化积木式指令编排

### 设备控制

内置常用嵌入式控制面板：

- LED 开关控制
- PWM 亮度控制
- 电机正转 / 反转 / 停止
- 传感器数据请求
- 自动刷新传感器数据

### 数据与协议

- 支持温度、湿度、距离等数据解析
- 支持实时数据仪表盘
- 支持波形图显示
- 支持自定义二进制协议帧解析
- 支持帧头、帧尾、类型字节、校验方式配置
- 支持协议帧统计

### 外观与体验

- 深色 / 浅色模式
- 中英文界面切换
- 自定义背景图片
- 毛玻璃视觉风格
- 响应式布局，适配不同屏幕尺寸

## 界面预览

> 如果你已经有截图，可以在仓库中新建 `docs/images/` 目录，并替换下面的图片路径。

```md
![LanMonitor Preview](docs/images/preview.png)
```

## 运行环境

由于项目使用浏览器硬件访问 API，需要满足以下条件：

| 功能 | 要求 |
| --- | --- |
| BLE | Chrome / Chromium 浏览器，支持 Web Bluetooth API |
| UART | Chrome 89+，支持 Web Serial API |
| 页面协议 | 必须通过 `HTTPS` 或 `localhost` 访问 |
| 不支持 | 直接通过 `file://` 打开时，Web Serial / Web Bluetooth 可能不可用 |

推荐环境：

- Google Chrome / Microsoft Edge / Chromium
- Windows / macOS / Linux
- Android Chrome 可用于部分 Web Bluetooth 场景
- 本地开发建议使用 `localhost` 服务启动页面

## 快速开始

### 方式一：直接部署到静态服务器

将 HTML 文件放到任意 HTTPS 静态服务器中，例如：

```txt
index.html
```

然后在 Chrome 中访问：

```txt
https://your-domain.com/index.html
```

### 方式二：本地启动

如果你只是在本机调试，可以使用 Python 快速启动本地服务：

```bash
python3 -m http.server 8000
```

然后打开：

```txt
http://localhost:8000
```

> 注意：请不要直接双击 HTML 文件使用 `file://` 打开，否则浏览器可能会阻止串口或蓝牙权限。

## BLE 使用说明

1. 打开页面后，进入 **蓝牙 BLE** 标签页。
2. 如需修改 BLE 参数，展开 **高级配置**。
3. 填写或确认：
   - Service UUID
   - Characteristic UUID
4. 点击右上角 **连接** 或左侧连接按钮。
5. 在浏览器弹出的蓝牙设备选择框中选择目标设备。
6. 连接成功后，发送区与设备控制区会自动解锁。
7. 在终端中查看接收数据，或在发送框中输入指令进行调试。

默认 BLE UUID：

```txt
Service UUID:        0000ffe0-0000-1000-8000-00805f9b34fb
Characteristic UUID: 0000ffe1-0000-1000-8000-00805f9b34fb
```

## UART 使用说明

1. 打开页面后，切换到 **串口 UART** 标签页。
2. 设置串口参数：
   - 波特率
   - 数据位
   - 校验位
   - 停止位
   - 流控制
3. 点击 **选择串口设备** 或右上角 **连接**。
4. 在浏览器弹出的系统串口选择框中选择 USB-TTL、开发板或串口设备。
5. 连接成功后，中间终端区域会显示串口接收数据。
6. 在底部发送区输入 ASCII 或 HEX 数据并发送。

常用配置：

| 参数 | 推荐值 |
| --- | --- |
| 波特率 | `115200` |
| 数据位 | `8` |
| 校验位 | `None` |
| 停止位 | `1` |
| 流控制 | `None` |

## 默认指令协议

LanMonitor 默认内置一组简单的 MCU 调试指令：

| 指令 | 说明 |
| --- | --- |
| `LED_ON` | 打开 LED |
| `LED_OFF` | 关闭 LED |
| `PWM:0~100` | 设置 PWM 亮度 |
| `MOTOR:F` | 电机正转 |
| `MOTOR:B` | 电机反转 |
| `MOTOR:S` | 电机停止 |
| `GET_DATA` | 请求一次传感器数据 |

默认返回格式：

```txt
TEMP:25.6
HUM:60.2
DIST:123
STATUS:OK
```

说明：

- `TEMP`：温度数据
- `HUM`：湿度数据
- `DIST`：距离数据
- `STATUS:OK`：设备执行成功反馈
- 默认会在发送内容末尾追加换行符 `\n`，可在显示选项中关闭

## 数据可视化

v4 版本加入了数据可视化能力，可用于传感器实时监控。

支持功能：

- 实时波形图
- 小型数据仪表盘
- 自动采样
- 采样暂停
- 采样上限设置
- 温度 / 湿度 / 距离等键值自动解析

示例数据：

```txt
TEMP:26.3
HUM:58.1
DIST:120
```

当终端接收到类似键值格式时，页面会自动更新对应数据卡片与曲线。

## 快捷指令与积木编程

### 快捷指令

右侧 **快捷指令** 面板支持：

- 新建指令
- 编辑指令内容
- 设置是否启用
- 设置 HEX 模式
- 设置发送前延时
- 单条发送
- 发送选中
- 循环发送

### 积木编程

右侧 **积木编程** 面板支持以可视化方式组合指令：

- LED 积木
- 电机积木
- PWM 积木
- 传感器积木
- HEX 积木
- 自定义积木

每个积木块支持：

- 指令内容
- 是否启用
- 独立延时
- HEX 模式
- 注释说明
- 拖拽排序

## 录制与回放

v4 版本加入通信录制与回放功能。

可用于：

- 记录调试过程
- 复现设备通信流程
- 保存测试数据
- 导出通信记录

支持操作：

- 开始录制
- 停止录制
- 保存录制记录
- 回放录制内容
- 导出单条录制
- 导出全部录制为 JSON
- 删除录制记录

## 自定义协议帧

内置协议帧编辑器可用于配置二进制协议解析规则。

支持配置：

- 协议名称
- 帧头
- 帧尾
- 类型字节偏移
- 校验字节偏移
- 校验方式
- 类型查找表
- 类型图标
- 类型计数统计

默认示例配置适用于类似 OpenMV 红绿灯识别的二进制帧：

```txt
帧头: AA 55
帧尾: 0D 0A
校验: XOR
类型: NONE / RED / GREEN
```

## 键盘快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl + F` | 打开终端搜索 |
| `Ctrl + B` | 切换 BLE 连接 |
| `Ctrl + U` | 切换 UART 连接 |
| `Ctrl + P` | 暂停 / 恢复接收 |
| `Ctrl + L` | 清空终端 |
| `Ctrl + K` | 聚焦发送输入框 |
| `Esc` | 关闭搜索框或弹窗 |
| `Enter` | 发送输入内容 |
| `Shift + Enter` | 输入换行 |

> macOS 用户通常可使用 `Command` 替代 `Ctrl`。

## 项目结构

如果项目是单文件版本，可以采用以下结构：

```txt
LanMonitor/
├── index.html
├── README.md
├── LICENSE
└── docs/
    └── images/
        └── preview.png
```

如果后续拆分为工程化版本，可参考：

```txt
LanMonitor/
├── public/
│   └── index.html
├── src/
│   ├── styles/
│   ├── scripts/
│   └── assets/
├── docs/
│   └── images/
├── README.md
└── LICENSE
```

## 常见问题

### 为什么点击串口没有反应？

请确认：

1. 使用 Chrome 89+ 或兼容 Chromium 浏览器。
2. 页面通过 `HTTPS` 或 `localhost` 打开。
3. 不是使用 `file://` 直接打开 HTML。
4. 串口设备驱动已安装。
5. 串口没有被其他软件占用。

### 为什么找不到 BLE 设备？

请确认：

1. 浏览器支持 Web Bluetooth API。
2. 设备已上电并处于可广播状态。
3. Service UUID 与设备实际 UUID 一致。
4. 系统蓝牙权限已开启。
5. 设备没有被其他 App 或浏览器页面占用。

### 为什么能连接但收不到数据？

请检查：

1. 设备端是否真正发送了数据。
2. 数据末尾是否包含换行符 `\n`。
3. 串口波特率是否一致。
4. BLE Characteristic 是否支持 Notify。
5. 是否开启了正确的 Service / Characteristic UUID。

### 为什么 HEX 发送结果不对？

HEX 发送时请使用十六进制字节格式，例如：

```txt
AA 55 01 5B 0D 0A
```

请避免输入非十六进制字符。

## 开发说明

该项目主要由以下技术组成：

- HTML5
- CSS3
- JavaScript ES6
- Web Bluetooth API
- Web Serial API
- LocalStorage
- Canvas 绘图

设计目标：

- 单文件即可运行
- 不依赖后端服务
- 不需要安装客户端
- 适合教学、实验和嵌入式快速调试

## 贡献

欢迎提交 Issue 或 Pull Request：

1. Fork 本仓库
2. 创建新分支

```bash
git checkout -b feature/your-feature
```

3. 提交修改

```bash
git commit -m "feat: add your feature"
```

4. 推送分支

```bash
git push origin feature/your-feature
```

5. 创建 Pull Request

## License

本项目可使用 MIT License。你也可以根据实际情况替换为自己的许可证。

```txt
MIT License
```
