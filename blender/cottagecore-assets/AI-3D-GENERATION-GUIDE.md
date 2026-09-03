# AI 3D 生成操作指南 —— 将 C0x 组件图转为精细 3D 模型

> 使用 Tripo3D (tripo3d.ai) 或 Meshy (meshy.ai) 的免费图片转3D功能
> 预计每个组件 1-3 分钟生成时间

---

## 推荐工具

| 工具 | 网址 | 免费额度 | 特点 |
|------|------|---------|------|
| **Tripo3D** ⭐首选 | https://www.tripo3d.ai/zh | 每日免费生成次数 | 中文界面，生成速度快，手办级质量 |
| **Meshy** | https://www.meshy.ai/zh | 每月免费额度 | 支持多种格式导出，纹理质量高 |

---

## 操作步骤（以 Tripo3D 为例）

### 1. 注册/登录
- 打开 https://www.tripo3d.ai/zh
- 用邮箱或 Google 账号注册（免费）

### 2. 选择"图片生成3D"
- 进入工作台后，选择 **"Image to 3D"**（图片转3D）
- 选择生成模式：
  - **"Sculpture"**（雕刻级）—— 细节更丰富，适合展示
  - **"Game-ready"**（游戏级）—— 四边面网格，适合后续编辑

### 3. 逐个上传组件图

以下按优先级排序，建议先生成核心组件：

#### P0 — 核心结构（先生成这些）

| 编号 | 上传图片 | 生成提示词（Prompt） | 预期输出 |
|------|---------|-------------------|---------|
| C01 | `C01-room-structure.png` | `Miniature diorama room, two solid walls, open front and right, wooden floor, mossy rock base, slanted roof with wooden beams, isometric view, cottagecore style, warm lighting` | 房间外壳 |
| C06 | `C06-rug-deer.png` | `Cute curled sleeping deer, cream colored body with white spots, tiny antlers, lying on woven oatmeal rug, miniature toy style, soft smooth surfaces` | 小鹿+地毯 |
| C03 | `C03-workdesk.png` | `L-shaped wooden desk with computer monitor, pinecone lamp, mushroom fairy figurine, books, potted plants, miniature desk accessories, cottagecore, smooth rounded edges` | 工作台+摆件 |

#### P1 — 主要家具

| 编号 | 上传图片 | 生成提示词 | 预期输出 |
|------|---------|-----------|---------|
| C05 | `C05-stump-cabinet.png` | `Tree stump shaped cabinet with three drawers, wood ring texture drawer fronts, branch handles, crystal snow globe on top, small wooden stool, cottagecore miniature` | 树桩柜+圆凳 |
| C07 | `C07-guitar.png` | `Acoustic guitar with light oak wood, vine carvings on edge, Q-version rounded shape, leaning against wall, miniature instrument` | 原木吉他 |
| C04 | `C04-pegboard.png` | `Wooden pegboard with hanging items: framed plant specimen, fern basket, scissors, trowel, rope ball, leather tool roll, spray bottle, miniature workshop tools` | 洞洞板+挂件 |

#### P2 — 装饰与氛围

| 编号 | 上传图片 | 生成提示词 | 预期输出 |
|------|---------|-----------|---------|
| C02 | `C02-window-decor.png` | `Arched wooden window with diamond lattice, bird nest with eggs, dried lavender, pinecones, hanging dried flower garland, miniature window scene` | 窗户+装饰 |
| C08 | `C08-signpost.png` | `Wooden signpost with three arrow signs, hand-carved text, rock base with grass, miniature forest sign` | 木质路标 |
| C09 | `C09-vines-atmosphere.png` | `Hanging ivy vines with leaves, small LED string lights, butterflies, floating dust particles, miniature plant decoration` | 藤蔓+氛围 |

### 4. 导出设置

生成完成后，对每个模型选择导出格式：

- **格式**: GLB 或 FBX（推荐 GLB，兼容性好）
- **多边形数**: 选择较高的选项（细节更好）
- **纹理**: 确保包含 PBR 纹理（基础色、法线、粗糙度）

### 5. 下载文件

下载的 GLB/FBX 文件命名建议：
```
tripo-c01-room.glb
tripo-c03-workdesk.glb
tripo-c05-stump.glb
tripo-c06-deer.glb
tripo-c07-guitar.glb
...
```

---

## 在 Blender 中组装

### 导入 GLB 文件
1. 打开 `cottagecore-scene.blend`（已有的体块骨架作为位置参考）
2. 删除对应的体块模型（保留空的位置参考）
3. **File → Import → glTF 2.0 (.glb/.gltf)**
4. 选择下载的精细 GLB 文件
5. 按 **S** 缩放调整大小，**G** 移动，**R** 旋转，对齐到骨架位置

### 材质调整
AI 生成的模型通常自带 PBR 材质，但可能需要微调：
- 在 **Shading** 工作区查看材质节点
- 调整 **Roughness**（粗糙度）让木头更真实
- 增加 **Subsurface**（次表面散射）让小鹿和蘑菇更柔软

### 灯光和渲染
- 使用已有的相机和灯光设置
- 渲染引擎切换为 **Cycles**（质量更高）
- 按 **F12** 渲染最终效果

---

## 预期效果

AI 生成的模型相比体块骨架会有质的飞跃：
- ✅ 圆润的倒角和曲面（不是方块）
- ✅ 真实的 PBR 材质纹理
- ✅ 正确的拓扑结构（可继续编辑）
- ✅ 法线贴图带来的表面细节

---

## 文件位置

所有需要上传的 C0x 组件图位于：
```
/Users/wanghaochen/research/my-website/blender/cottagecore-assets/
├── C01-room-structure.png
├── C02-window-decor.png
├── C03-workdesk.png
├── C04-pegboard.png
├── C05-stump-cabinet.png
├── C06-rug-deer.png
├── C07-guitar.png
├── C08-signpost.png
└── C09-vines-atmosphere.png
```

---

## 备选方案

如果 Tripo3D 免费额度用完：

1. **Meshy** (meshy.ai) — 同样的图片转3D流程
2. **CSM** (csm.ai) — 单图生3D，质量也很好
3. **Sudo AI** — 概念图转3D资产

所有工具都是免费注册，可组合使用。
