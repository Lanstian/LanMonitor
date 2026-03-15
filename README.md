# LanMonitor
A browser-based BLE debug and control panel for STM32 + HM-10, built with Web Bluetooth API. Supports bilingual UI, custom background, glassmorphism theme, and mobile adaptation.
# LanMonitor

一个基于 **Web Bluetooth API** 的 STM32 蓝牙控制面板网页。  
用于通过浏览器连接 **HM-10 BLE 模块**，实现对 STM32 设备的可视化控制、数据调试与串口交互。

---

## 项目简介

LanMonitor 是一个面向 **STM32 + HM-10 蓝牙串口通信场景** 的网页控制面板。  
项目运行于支持 **Web Bluetooth API** 的 Chrome 浏览器（PC / Android），无需安装原生客户端，即可通过网页完成蓝牙连接、指令发送、调试输出查看等操作。

在原有基础功能上，项目还加入了更细腻的界面设计与交互体验，包括：

- 毛玻璃风格界面
- 多层级设置菜单
- 中英双语切换
- 自定义背景上传
- 日间模式切换
- 移动端适配
- 调试区与控制区分栏布局

默认主题名称为：**兰式古典**

---

## 主要功能

### 1. 蓝牙连接与通信
- 通过 Web Bluetooth API 扫描并连接 HM-10 模块
- 支持 BLE 特征读写
- 可向 STM32 发送控制指令
- 可接收 STM32 返回的数据并显示在调试区

### 2. 控制面板
- 左侧固定控制区
- 支持多功能按钮、菜单分组与层级组织
- 适合扩展更多设备控制功能

### 3. 调试输出区
- 右侧调试区用于显示日志、串口返回、设备状态
- 适合开发阶段进行通信验证与数据观察
- 已优化为与整体风格一致的半透明玻璃质感

### 4. 设置系统
当前设置项支持：

- **白天模式切换**
- **界面语言切换**
  - 中文
  - English
- **自定义背景上传**
  - 支持本地上传图片作为网页背景
  - 支持恢复默认背景
- **主题显示**
  - 默认主题：兰式古典

### 5. 界面与交互优化
- 毛玻璃视觉风格
- 更统一的半透明层次表现
- 保持原有设计语言不被破坏
- 移动端适配，适合手机浏览器访问

---

## 技术栈

- HTML5
- CSS3
- JavaScript
- Web Bluetooth API

---

## 设备与通信背景

本项目基于如下硬件通信方案：

- 主控：STM32
- 蓝牙模块：HM-10（BLE 4.0）
- STM32 与 HM-10 通过 UART 串口通信
- 网页端通过浏览器的 Web Bluetooth API 与 HM-10 建立 BLE 连接

### HM-10 UUID
- **Service UUID**：`0000ffe0-0000-1000-8000-00805f9b34fb`
- **Characteristic UUID**：`0000ffe1-0000-1000-8000-00805f9b34fb`

---

## 使用方式

### 1. 环境要求
请使用支持 Web Bluetooth 的浏览器，例如：

- Google Chrome（Windows）
- Google Chrome（Android）

> 注意：部分浏览器或系统环境可能不支持 Web Bluetooth API。

### 2. 启动项目
这是一个纯前端网页项目，直接打开 `index.html` 即可运行。  
也可以部署到 GitHub Pages、Vercel 或其他静态网页托管平台。

### 3. 基本操作流程
1. 打开网页
2. 点击蓝牙连接按钮
3. 在弹出的设备列表中选择 HM-10
4. 建立连接后进行指令发送与数据调试
5. 在设置中可切换语言、主题模式或上传背景图

---

## 项目结构

```text
LanMonitor/
├─ index.html          # 主页面
├─ README.md           # 项目说明文档
└─ .gitignore          # Git 忽略配置
