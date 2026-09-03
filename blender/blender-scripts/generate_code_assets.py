#!/usr/bin/env python3
"""代码补全 3D 组件: 书堆 C09 / 藤蔓挂饰 VINES / 小鹿地毯 C06
用法: python3 generate_code_assets.py <输出目录>
"""
import sys, os, math
import numpy as np
import trimesh

out_dir = sys.argv[1] if len(sys.argv) > 1 else "."
os.makedirs(out_dir, exist_ok=True)


def colored(mesh, rgb, rough=0.7, emissive=None):
    """给 mesh 设置 PBR 材质颜色"""
    mesh.visual = trimesh.visual.TextureVisuals(
        material=trimesh.visual.material.PBRMaterial(
            name="mat",
            baseColorFactor=[int(rgb[0] * 255), int(rgb[1] * 255), int(rgb[2] * 255), 255],
            metallicFactor=0.0,
            roughnessFactor=rough,
            emissiveFactor=[*emissive] if emissive else [0, 0, 0],
        )
    )
    return mesh


def ellipsoid(rx, ry, rz, subdivisions=3):
    s = trimesh.creation.icosphere(subdivisions=subdivisions, radius=1.0)
    s.apply_scale([rx, ry, rz])
    return s


# ============================================================
# C09 — 书堆：3 本圆角书叠放
# ============================================================
def fix_orientation(scene):
    """trimesh 是 Z-up，glTF 规范是 Y-up。导出前把 +Z 旋转到 +Y，
    Blender 导入后会自动转回 Z-up，最终朝向正确。"""
    scene.apply_transform(
        trimesh.transformations.rotation_matrix(math.radians(-90), [1, 0, 0]))


def make_books():
    parts = []
    book_colors = [(0.96, 0.94, 0.88), (0.85, 0.72, 0.55), (0.33, 0.45, 0.29)]
    book_sizes = [(0.62, 0.44, 0.09), (0.58, 0.42, 0.085), (0.54, 0.40, 0.08)]
    z = 0.0
    rotations = [0, math.radians(8), math.radians(-14)]
    for (w, d, h), c, ry in zip(book_sizes, book_colors, rotations):
        b = trimesh.creation.box([w, d, h])
        b.apply_translation([0, 0, z + h / 2])
        b.apply_transform(trimesh.transformations.rotation_matrix(ry, [0, 0, 1]))
        parts.append(colored(b, c, rough=0.85))
        z += h
    scene = trimesh.Scene()
    for i, p in enumerate(parts):
        scene.add_geometry(p, node_name=f"book{i}")
    fix_orientation(scene)
    scene.export(os.path.join(out_dir, "C09-books.glb"))
    print("C09-books.glb OK")


# ============================================================
# VINES — 垂吊藤蔓：横梁 + 3 条垂藤 + 叶子 + 灯串
# ============================================================
def tube_along(points, radius, sections=8):
    """沿折线生成圆管：逐段圆柱合并"""
    cylinders = []
    for i in range(len(points) - 1):
        a, b = np.asarray(points[i]), np.asarray(points[i + 1])
        v = b - a
        length = np.linalg.norm(v)
        if length < 1e-6:
            continue
        cyl = trimesh.creation.cylinder(radius=radius, height=length, sections=sections)
        # cylinder 默认沿 Z 轴；旋转对齐 v
        z_axis = np.array([0, 0, 1.0])
        v_n = v / length
        rot = trimesh.geometry.align_vectors(z_axis, v_n)
        cyl.apply_transform(rot)
        cyl.apply_translation((a + b) / 2)
        cylinders.append(cyl)
    merged = trimesh.util.concatenate(cylinders)
    return merged


def vine_curve(n_points, length, sway, seed):
    rng = np.random.default_rng(seed)
    t = np.linspace(0, 1, n_points)
    x = np.cumsum(rng.normal(0, 0.015, n_points)) + np.sin(t * math.pi * 2.2 + seed) * sway * t
    y = np.cumsum(rng.normal(0, 0.015, n_points)) * 0.5
    z = -t * length
    pts = np.stack([x, y, z], axis=1)
    pts -= pts[0]  # 起点在原点
    return pts


def make_vines():
    rng = np.random.default_rng(7)
    scene = trimesh.Scene()
    beam_len = 2.4
    # 横梁（做旧木色）
    beam = trimesh.creation.box([beam_len, 0.12, 0.1])
    beam.apply_translation([0, 0, 0])
    scene.add_geometry(colored(beam, (0.55, 0.42, 0.30), rough=0.9), node_name="beam")

    vine_stems = [(-0.85, 0.9), (0.0, 1.1), (0.8, 0.85)]
    leaf_greens = [(0.35, 0.55, 0.30), (0.45, 0.65, 0.33), (0.28, 0.48, 0.26)]

    for vi, (x0, length) in enumerate(vine_stems):
        pts = vine_curve(60, length, sway=0.18, seed=vi + 1)
        pts[:, 0] += x0
        stem = tube_along(pts, radius=0.018, sections=6)
        scene.add_geometry(colored(stem, (0.42, 0.52, 0.28), rough=0.85), node_name=f"stem{vi}")
        # 叶子
        for i in range(4, 60, 5):
            leaf = ellipsoid(0.075, 0.05, 0.012, subdivisions=2)
            leaf.apply_transform(
                trimesh.transformations.rotation_matrix(rng.uniform(0, 6.28), [0, 0, 1]))
            leaf.apply_transform(
                trimesh.transformations.rotation_matrix(math.radians(60), [1, 0, 0]))
            leaf.apply_translation(pts[i] + [0, 0.03, 0])
            scene.add_geometry(
                colored(leaf, leaf_greens[(i + vi) % 3], rough=0.8), node_name=f"leaf{vi}_{i}")
        # 灯串光球
        for i in range(10, 60, 16):
            bulb = trimesh.creation.icosphere(subdivisions=2, radius=0.035)
            bulb.apply_translation(pts[i] + [0, -0.05, -0.02])
            scene.add_geometry(
                colored(bulb, (1.0, 0.9, 0.6), emissive=(1.0, 0.85, 0.5)), node_name=f"bulb{vi}_{i}")

    fix_orientation(scene)
    scene.export(os.path.join(out_dir, "vines.glb"))
    print("vines.glb OK")


# ============================================================
# C06 — 小鹿地毯：圆毯 + 流苏 + 低模风格化睡鹿
# ============================================================
def make_rug_deer():
    rng = np.random.default_rng(3)
    scene = trimesh.Scene()

    # 圆形编织毯（双层色环）
    rug_r = 1.0
    rug = trimesh.creation.cylinder(radius=rug_r, height=0.05, sections=48)
    rug.apply_translation([0, 0, 0.025])
    scene.add_geometry(colored(rug, (0.45, 0.62, 0.47), rough=0.95), node_name="rug")
    inner = trimesh.creation.cylinder(radius=rug_r * 0.72, height=0.052, sections=48)
    inner.apply_translation([0, 0, 0.025])
    scene.add_geometry(colored(inner, (0.55, 0.70, 0.55), rough=0.95), node_name="rug_inner")
    core = trimesh.creation.cylinder(radius=rug_r * 0.45, height=0.054, sections=48)
    core.apply_translation([0, 0, 0.025])
    scene.add_geometry(colored(core, (0.47, 0.64, 0.49), rough=0.95), node_name="rug_core")
    # 流苏：边缘放射小圆柱
    for i in range(36):
        a = i / 36 * 2 * math.pi
        tassel = trimesh.creation.cylinder(radius=0.018, height=0.14, sections=5)
        rot = trimesh.transformations.rotation_matrix(math.pi / 2, [0, 1, 0])
        tassel.apply_transform(rot)
        tassel.apply_transform(
            trimesh.transformations.rotation_matrix(a, [0, 0, 1]))
        tassel.apply_translation([math.cos(a) * (rug_r + 0.06), math.sin(a) * (rug_r + 0.06), 0.025])
        scene.add_geometry(colored(tassel, (0.78, 0.82, 0.70), rough=0.9), node_name=f"tassel{i}")

    # 睡鹿（低模拼球，浅灰棕粘土风）
    deer = (0.72, 0.58, 0.46)
    deer_dark = (0.55, 0.42, 0.33)
    # 身体：卧姿椭球（长轴沿 X，头在 -X 端）
    body = ellipsoid(0.42, 0.24, 0.19)
    body.apply_translation([0.05, 0, 0.22])
    scene.add_geometry(colored(body, deer, rough=0.75), node_name="deer_body")
    # 头
    head = trimesh.creation.icosphere(subdivisions=3, radius=0.19)
    head.apply_translation([-0.42, 0, 0.40])
    scene.add_geometry(colored(head, deer, rough=0.75), node_name="deer_head")
    # 吻部
    snout = ellipsoid(0.09, 0.07, 0.06)
    snout.apply_translation([-0.56, 0, 0.36])
    scene.add_geometry(colored(snout, (0.92, 0.88, 0.82), rough=0.8), node_name="deer_snout")
    # 鼻头
    nose = trimesh.creation.icosphere(subdivisions=2, radius=0.025)
    nose.apply_translation([-0.63, 0, 0.37])
    scene.add_geometry(colored(nose, (0.25, 0.2, 0.18)), node_name="deer_nose")
    # 耳朵
    for sy in (-1, 1):
        ear = ellipsoid(0.08, 0.035, 0.05)
        ear.apply_transform(trimesh.transformations.rotation_matrix(math.radians(50 * sy), [0, 1, 0]))
        ear.apply_transform(trimesh.transformations.rotation_matrix(math.radians(35 * sy), [1, 0, 0]))
        ear.apply_translation([-0.40, sy * 0.17, 0.55])
        scene.add_geometry(colored(ear, deer_dark, rough=0.75), node_name=f"deer_ear{sy}")
    # 鹿角（简单分叉：主枝+一叉）
    for sy in (-1, 1):
        main = tube_along([[0, 0, 0], [0.05, sy * 0.05, 0.16], [0.16, sy * 0.12, 0.30]], 0.02, 5)
        main.apply_translation([-0.42, sy * 0.10, 0.55])
        scene.add_geometry(colored(main, deer_dark), node_name=f"antler{sy}a")
        fork = tube_along([[0, 0, 0], [0.09, sy * 0.02, 0.10]], 0.016, 5)
        fork.apply_translation([-0.34, sy * 0.14, 0.68])
        scene.add_geometry(colored(fork, deer_dark), node_name=f"antler{sy}b")
    # 闭眼：两条黑色小弧（压扁小球代替）
    for sy in (-1, 1):
        eye = ellipsoid(0.035, 0.012, 0.012)
        eye.apply_transform(trimesh.transformations.rotation_matrix(math.radians(20 * sy), [0, 0, 1]))
        eye.apply_translation([-0.50, sy * 0.12, 0.45])
        scene.add_geometry(colored(eye, (0.2, 0.17, 0.15)), node_name=f"deer_eye{sy}")
    # 尾巴
    tail = trimesh.creation.icosphere(subdivisions=2, radius=0.07)
    tail.apply_translation([0.45, 0, 0.34])
    scene.add_geometry(colored(tail, (0.92, 0.88, 0.82), rough=0.8), node_name="deer_tail")
    # 前腿收起的小蹄
    hoof = ellipsoid(0.08, 0.06, 0.05)
    hoof.apply_translation([-0.18, 0.14, 0.16])
    scene.add_geometry(colored(hoof, deer_dark), node_name="deer_hoof")

    fix_orientation(scene)
    scene.export(os.path.join(out_dir, "C06-rug-deer.glb"))
    print("C06-rug-deer.glb OK")


if __name__ == "__main__":
    make_books()
    make_vines()
    make_rug_deer()
