# 森系自然风微缩工作室 —— 最终版设计清单

> 基于最终目标效果图，按"独立可生成组件"粒度拆分。所有组件导出 GLB 后，在 Blender 中按此文档的坐标和尺寸组装。
> 坐标系：以房间地板中心为原点 (0,0,0)，X 轴向右，Y 轴向前，Z 轴向上。

---

## 已有组件（无需重新生成）

| 编号 | 名称 | 状态 | 文件位置 |
|------|------|------|----------|
| C05 | 树桩柜 | ✅ 已有 GLB | `glb-preview/C05-树桩夜柜3d模型.glb` |
| C08 | 木质路牌 | ✅ 已有 GLB | `glb-preview/C08-signpost.glb` |

---

## 待生成组件清单（共 14 件）

### 【结构类】

#### A01 — L 形工作台
- **描述**：原木色 L 形书桌。长边靠后墙，短边向右延伸。桌腿是**树桩造型**（粗壮的圆柱形，带树皮纹理）。左侧带 3 层抽屉柜（绿色金属拉手），右侧是 2×2 开放书架格（放书籍和藤编收纳盒）。桌面边缘有轻微磨损感，整体和 C03 概念图风格一致。
- **风格**：粘土质感、微缩模型、森系手作
- **颜色**：`#C4956A` 中木色主体，`#7A8B6E` 哑光绿抽屉面板
- **尺寸基准**：长边约 5 单元，短边约 3 单元，高 2.5 单元，桌面厚 0.15
- **Tripo Prompt**：`A cute miniature L-shaped wooden desk with tree stump legs, drawers and open shelves, clay stylized art style, forest cottagecore aesthetic, worn wood texture with bark details, cozy craft room, 3D render, isometric view`

#### A02 — 旋转椅
- **描述**：浅木色藤编旋转椅，椅背有编织纹理。座垫上有两个方形靠枕（浅绿碎花布），椅背上搭着一条垂下来的针织毛毯（薄荷绿色，有流苏）。
- **风格**：粘土质感、手工编织感
- **颜色**：`#D4A574` 浅木色，`#8FB88F` 薄荷绿毯子，`#E8E4D0` 米色靠枕
- **Tripo Prompt**：`A cute miniature wooden swivel chair with woven rattan back, two small floral cushions and a draped mint green knitted blanket, clay stylized art style, cottagecore forest aesthetic, cozy craft room, 3D render`

#### A03 — 拱形窗户
- **描述**：后墙中央的拱形大窗户。木质窗框（中木色），玻璃透出模糊的森林远景（绿+蓝）。窗台略宽，可放小盆栽。
- **风格**：粘土质感、温馨
- **颜色**：`#C4956A` 木框，`#B8D4E3` 玻璃
- **Tripo Prompt**：`A cute miniature arched wooden window frame with glass panes, clay stylized art style, forest cottage aesthetic, warm wood texture, soft natural light coming through, 3D render`

#### A04 — 屋顶 + 垂吊藤蔓
- **描述**：人字形木质斜屋顶，从左前方向右后方倾斜。木梁粗犷有纹理，边缘有小的檐口装饰。屋顶边缘和木梁上垂吊着大量绿色藤蔓和小叶子，部分藤蔓顺着左墙面垂到地面。
- **风格**：自然风、微缩粘土
- **颜色**：`#A67B5B` 深木色，`#6B9E75` 藤蔓绿
- **Tripo Prompt**：`A cute miniature wooden gable roof with hanging ivy vines and small leaves draping down, clay stylized art style, forest cottagecore aesthetic, weathered wood texture, lush green vines, 3D render`

---

### 【桌面物件类】

#### B01 — 电脑套装（显示器+键盘+鼠标）
- **描述**：参考 C03 概念图风格。一台圆角米白色显示器（像小电视），屏幕显示绿色叶子/代码界面，带木质支架底座。配一个紧凑型键盘（米白色底+浅绿色按键）。再加一个小圆鼠标（米白色）。整体是可爱的复古科技风，和森系工作室氛围融合。
- **风格**：粘土质感、复古可爱科技
- **颜色**：`#F5F0E0` 米白机身，`#8FB88F` 绿色按键/屏幕，`#C4956A` 木质支架
- **Tripo Prompt**：`A cute miniature computer set with rounded cream white monitor showing green leaf pattern screen on wooden stand, matching compact keyboard with cream and green keys, and a small round mouse, clay stylized art style, forest cottagecore aesthetic, retro cute tech, cozy desk scene, 3D render`

#### B02 — 黄铜台灯
- **描述**：复古黄铜台灯，带可调节灯臂和玻璃灯罩。灯亮着，发出温暖的黄色光芒。底座是圆形黄铜，灯柱有精致的旋钮细节。
- **风格**：复古、精致
- **颜色**：`#D4A574` 黄铜色，`#FFF8E7` 暖黄光
- **Tripo Prompt**：`A cute miniature vintage brass desk lamp with glass shade, warm glowing light, clay stylized art style, forest cottage aesthetic, metallic brass texture, cozy desk scene, 3D render`

#### B03 — 玻璃罩植物标本
- **描述**：一个透明玻璃圆顶罩（像钟罩），底座是木质圆形托盘。罩内有几枝干花和迷你植物标本，营造出被精心保存的自然美感。
- **风格**：精致、自然
- **颜色**：`#E8D4C0` 木底座，`#F5F0E8` 干花
- **Tripo Prompt**：`A cute miniature glass cloche dome with dried flowers and small plant specimens inside on a wooden base, clay stylized art style, forest cottagecore aesthetic, delicate and precious, 3D render`

#### B04 — 书堆
- **描述**：3~4 本旧书叠放在一起，封面颜色各异（米白、浅棕、深绿）。书脊有轻微磨损，顶部那本微微倾斜，显得自然随意。
- **风格**：复古、手作
- **颜色**：`#F5F0E0` 米白，`#C4956A` 浅棕，`#4A6741` 深绿
- **Tripo Prompt**：`A cute miniature stack of 3 old books with worn covers in cream, brown and green colors, clay stylized art style, forest cottage aesthetic, cozy desk decoration, 3D render`

#### B05 — 小花瓶 + 干花 + 盆栽组合
- **描述**：一组小型植物装饰：（1）一个矮胖的绿色陶瓷小花瓶，插着几枝白色小碎花；（2）一个桌下地面的小陶盆，里面种着茂盛的绿色小植物。
- **风格**：自然、清新
- **颜色**：`#7A8B6E` 花瓶绿，`#F5F0E8` 白花
- **Tripo Prompt**：`A cute miniature green ceramic vase with small white dried flowers and a small potted plant in terracotta pot, clay stylized art style, forest cottagecore aesthetic, fresh and natural, 3D render`

---

### 【墙面装饰类】

#### C01 — 洞洞板及挂饰
- **描述**：一块大型木质洞洞板挂在左墙上。板上挂着：银色小剪刀、园艺工具、一个绿色毛线球、几束垂吊的小绿植（蕨类）、几张小卡片/便签、一个迷你相框。整体错落有致。
- **风格**：手作工坊、温馨
- **颜色**：`#C4956A` 木板，`#8FB88F` 绿植/毛线
- **Tripo Prompt**：`A cute miniature wooden pegboard with hanging scissors, garden tools, a green yarn ball, hanging fern plants, small cards and a mini photo frame, clay stylized art style, craft workshop aesthetic, cozy and organized, 3D render`

#### C02 — 墙面小装饰
- **描述**：窗户旁边墙上的小装饰组合：（1）一个挂着的迷你相框（里面是植物插画）；（2）一个绿色小信封袋/壁挂收纳袋（里面插着几张明信片）；（3）窗户上方的小搁板（摆着迷你装饰）。
- **风格**：温馨、细节
- **Tripo Prompt**：`A cute miniature wall decoration set with a small framed botanical illustration, a green hanging envelope pocket with postcards, and a tiny shelf with mini decorations, clay stylized art style, forest cottagecore aesthetic, 3D render`

---

### 【地面类】

#### D01 — 编织地毯 + 睡觉橘猫
- **描述**：一张圆形绿色编织地毯，纹理清晰可见（像手工编织的绳结纹理）。地毯中央蜷缩着一只睡着的橘猫，尾巴搭在鼻子前，毛发柔软蓬松。
- **风格**：温暖、治愈
- **颜色**：`#7FB285` 地毯绿，`#E8A87C` 橘猫
- **Tripo Prompt**：`A cute miniature round woven green rug with a sleeping orange tabby cat curled up in the center, clay stylized art style, forest cottagecore aesthetic, soft cozy texture, peaceful and warm, 3D render`

---

### 【外围底座类】

#### E01 — 苔藓底座环境
- **描述**：整个房间坐落在一个圆形底座上。底座边缘是一圈起伏的苔藓和泥土，上面点缀着：（1）几颗灰白色鹅卵石（大小不一）；（2）几簇白色小蘑菇；（3）几丛绿色小草和蕨类植物。整体像森林地面的感觉。
- **风格**：自然、有机
- **颜色**：`#6B9E75` 苔藓绿，`#F5F2EC` 石头，`#FFF8F0` 蘑菇
- **Tripo Prompt**：`A cute miniature forest floor base with moss, gray white pebbles, small white mushrooms, and tiny fern plants, clay stylized art style, cottagecore aesthetic, organic natural textures, 3D render`

#### E02 — 藤编篮子
- **描述**：一个圆形藤编篮子（浅棕色），放在房间右前方的地面上。篮子里装着几颗灰白色的蛋/石头，篮子边缘有自然的编织纹理。
- **风格**：手作、田园
- **颜色**：`#D4A574` 藤编棕，`#F5F2EC` 蛋/石
- **Tripo Prompt**：`A cute miniature woven wicker basket with several white eggs inside, clay stylized art style, forest cottagecore aesthetic, natural woven texture, cozy farm feel, 3D render`

---

## 组装指南（供 Blender 阶段使用）

| 组件 | 建议摆放位置 | 备注 |
|------|-------------|------|
| A01 工作台 | 靠后墙，L 拐角在右侧 | 主体定位基准 |
| A02 旋转椅 | 工作台前方偏右 | 面向桌面 |
| A03 窗户 | 后墙中央 | 工作台上方 |
| A04 屋顶 | 房间顶部 | 覆盖整个空间 |
| B01 电脑套装 | 工作台长边右侧 | 靠近窗户 |
| B02 台灯 | 工作台短边（右侧） | 电脑旁边 |
| B03 玻璃罩 | 电脑旁边 | 略靠前 |
| B04 书堆 | 电脑和台灯之间 | 靠墙摆放 |
| B05 小花瓶 | 书堆旁边 / 桌下地面 | 点缀 |
| C01 洞洞板 | 左墙中央 | 工作台上方 |
| C02 墙面装饰 | 窗户周围 | 分散布置 |
| D01 地毯+猫 | 房间中央地面 | 椅子前方 |
| E01 苔藓底座 | 整个房间底部 | 承托所有结构 |
| E02 藤编篮子 | 右前方地面上 | 蘑菇旁边 |
| C05 树桩柜 | （已有，待定位置） | 可与抽屉柜功能合并或替换 |
| C08 路牌 | 左墙外侧 | 按原设计 |

---

## 下一步流程

1. ✅ 设计清单确认（当前文档）
2. ⏳ 按上表逐个生成 2D 概念图（PNG）
3. ⏳ 用户将 2D 图上传 Tripo3D，使用对应 Prompt 生成 GLB
4. ⏳ 所有 GLB 收集完毕后，在 Blender 中按此文档组装
