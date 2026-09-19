# -*- coding: utf-8 -*-
"""
喵卡卡 像素素材生成脚本
用 ASCII 网格定义像素画，导出 PNG 到 src/static/pixel/ 与 src/static/tabbar/
用法: python scripts/gen_assets.py
"""
import os
from PIL import Image

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "static", "pixel")
TAB_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "static", "tabbar")

# ============ 调色板 ============
# 每个字符 -> RGB。'.' 表示透明
CAT_PALETTES = {
    # 橘猫
    "orange": {"k": (74, 55, 40), "b": (240, 150, 70), "d": (214, 116, 44),
               "l": (255, 226, 181), "p": (244, 154, 143), "e": (51, 40, 33), "w": (255, 255, 255)},
    # 白猫
    "white": {"k": (74, 55, 40), "b": (250, 246, 235), "d": (226, 216, 198),
              "l": (255, 255, 255), "p": (244, 154, 143), "e": (51, 40, 33), "w": (255, 255, 255)},
    # 黑猫
    "black": {"k": (30, 26, 30), "b": (66, 58, 66), "d": (46, 40, 46),
              "l": (120, 110, 120), "p": (196, 110, 120), "e": (245, 200, 90), "w": (255, 255, 255)},
    # 灰猫
    "gray": {"k": (60, 55, 62), "b": (158, 156, 166), "d": (128, 126, 138),
             "l": (224, 222, 226), "p": (244, 154, 143), "e": (51, 40, 33), "w": (255, 255, 255)},
    # 三花猫
    "calico": {"k": (74, 55, 40), "b": (250, 240, 220), "d": (224, 138, 58),
               "l": (255, 255, 255), "p": (244, 154, 143), "e": (51, 40, 33), "w": (51, 40, 33)},
}

# ============ 猫咪姿态（16x16）============
CAT_IDLE = [
    "................",
    "................",
    "..k..........k..",
    "..kpk......kpk..",
    ".kkkkkkkkkkkkkk.",
    ".kddbbbbbbbbddk.",
    ".kbeebbbbbbeebk.",
    ".kbeebbbbbbeebk.",
    ".kbbbbllllbbbbk.",
    ".kbbbblpplbbbbk.",
    ".kkbbbbllbbbbkk.",
    "..kbbbbbbbbbbkk.",
    "..kbblbbbblbbk.k",
    "..kbblbbbblbbk.k",
    "..kbbbbbbbbbbk.k",
    "..kkkkkkkkkkkk..",
]

CAT_HAPPY = [
    "...w........w...",
    "................",
    "..k...ww....k...",
    "..kpk......kpk..",
    ".kkkkkkkkkkkkkk.",
    ".kddbbbbbbbbddk.",
    ".kbkkbbbbbbkkbk.",
    ".kbkkbllllbkkbk.",
    ".kbbbbllllbbbbk.",
    ".kbbbblpplbbbbk.",
    ".kkbbbllllbbbkk.",
    "..kbbbbbbbbbbkk.",
    "..kbblbbbblbbk.k",
    "..kbblbbbblbbk.k",
    "..kbbbbbbbbbbk.k",
    "..kkkkkkkkkkkk..",
]

CAT_ATTACK = [
    "................",
    "..............x.",
    "...k........k..x",
    "...kpk......kpk.",
    "..kkkkkkkkkkkkk.",
    "..kddbbbbbbbbdk.",
    "..kbeebbbbbbeeb.",
    "..kbbbbllllbbbbk",
    "..kbbbblpplbbbk.",
    ".kkbbbbblllbbbk.",
    ".kbbbbbbbbbkkkk.",
    "..kbbbbbbbbbbkkk",
    "..kbblbbbblbbk..",
    "..kbblbbbblbbk..",
    "..kbbbbbbbbbbk..",
    "..kkkkkkkkkkkk..",
]

CAT_PALETTES["orange"]["x"] = (255, 235, 130)
for p in CAT_PALETTES.values():
    p.setdefault("x", (255, 235, 130))  # 攻击特效亮黄

# ============ BOSS（16x16）============
BOSS_PALETTES = {
    "slime": {"k": (40, 72, 40), "b": (110, 190, 90), "d": (80, 150, 66),
              "l": (190, 235, 170), "e": (30, 40, 30), "m": (50, 90, 46)},
    "bat": {"k": (46, 32, 58), "b": (128, 92, 168), "d": (96, 64, 132),
            "l": (200, 170, 230), "e": (235, 90, 80), "m": (250, 250, 250)},
    "ghost": {"k": (56, 70, 96), "b": (214, 226, 244), "d": (170, 188, 216),
              "l": (240, 246, 252), "e": (56, 70, 96), "m": (120, 140, 170)},
    "demon": {"k": (60, 24, 30), "b": (200, 74, 74), "d": (160, 48, 56),
              "l": (240, 160, 120), "e": (255, 220, 90), "m": (250, 244, 234)},
}

BOSS_SLIME = [
    "................",
    "................",
    "................",
    ".....kkkkkk.....",
    "...kkbbbbbbkk...",
    "..kbbllbbbbbbk..",
    "..kbllbbbbbbbk..",
    ".kbbbbbbbbbbbbk.",
    ".kbeebbbbbeebbk.",
    ".kbeebbbbbeebbk.",
    ".kbbbbbkkbbbbbk.",
    ".kbbbbkbbkbbbbk.",
    "kbbbbbbbbbbbbbbk",
    "kbbdbbbbbbbbdbbk",
    ".kkddddddddddkk.",
    "..kkkkkkkkkkkk..",
]

BOSS_BAT = [
    "................",
    "................",
    "................",
    ".k...........k..",
    ".kk...kkkk..kk..",
    ".kbkkkbbbbkkkbk.",
    ".kbbkbbdbbbkbbk.",
    ".kbbkbbbbbbkbbk.",
    "..kkbeebbeebkk..",
    "...kbeebbeebk...",
    "...kbbkbbkbbk...",
    "....kbmbmbmbk...",
    "....kbbmmbbk....",
    ".....kkkkkk.....",
    "................",
    "................",
]

BOSS_GHOST = [
    "................",
    "................",
    ".....kkkkkk.....",
    "...kkbbbbbbkk...",
    "..kbbllllbbbbk..",
    ".kbbllbbbbbbbbk.",
    ".kbllbbbbbbbbbk.",
    ".kbbbbbkkbbbbbk.",
    ".kbbeekbbeekbbk.",
    ".kbbeekbbeekbbk.",
    ".kbbbbbbbbbbbbk.",
    ".kbbbkbbbbkbbbk.",
    ".kbbbbbbbbbbbbk.",
    "..kbkbkbkbkbkbk.",
    "..kbkbkbkbkbkbk.",
    "...kk.kkk.kk.k..",
]

BOSS_DEMON = [
    "..k...........k.",
    ".kdk.........kdk",
    ".kdk..kkkk..kdk.",
    ".kdkkkddddkkkdk.",
    "..kkddbbbbddkk..",
    "...kbbbbbbbbk...",
    "..kbbbwbbwbbbk..",
    ".kbbbeebbbeebbk.",
    ".kbbbeebbbeebbk.",
    ".kbbbbbbbbbbbbk.",
    ".kbbbkbbbbkbbbk.",
    ".kbbbkbbbbkbbbk.",
    "..kbbmbbbbmbbk..",
    "..kbbmbbbbmbbk..",
    "...kbbbbbbbbk...",
    "....kkkkkkkk....",
]

# ============ 小图标（12x12）============
ICON_PALETTES = {
    "coin": {"k": (140, 96, 30), "b": (247, 201, 72), "l": (255, 232, 150), "d": (214, 160, 40)},
    "flame": {"k": (150, 60, 20), "b": (245, 130, 48), "l": (255, 210, 90), "d": (220, 90, 40)},
    "heart": {"k": (150, 40, 60), "b": (217, 87, 99), "l": (245, 160, 170)},
    "star": {"k": (160, 110, 20), "b": (247, 201, 72), "l": (255, 240, 170)},
    "trophy": {"k": (140, 96, 30), "b": (247, 201, 72), "l": (255, 232, 150), "d": (120, 80, 24)},
    "bell": {"k": (140, 96, 30), "b": (247, 201, 72), "l": (255, 232, 150), "d": (214, 160, 40)},
    "sword": {"k": (60, 60, 70), "b": (180, 190, 205), "l": (230, 236, 244), "d": (218, 87, 99)},
    "camera": {"k": (50, 50, 60), "b": (110, 120, 135), "l": (180, 195, 210), "p": (218, 87, 99)},
}

ICON_COIN = [
    "............",
    "...kkkkkk...",
    "..kbbbbbbk..",
    ".kbllbbbbdk.",
    ".kblbbbbbdk.",
    "kbbbbbdbbdbk",
    "kbbbbbdbbdbk",
    "kbbbbbdbbdbk",
    ".kbbbbbdbdk.",
    ".kbbbbbbddk.",
    "..kbbbbddk..",
    "...kkkkkk...",
]

ICON_FLAME = [
    ".....kk.....",
    "....kbk.....",
    "...kbbbk....",
    "...kblbk....",
    "..kbblbbk...",
    "..kbblbbk...",
    ".kbbblbbbk..",
    ".kbblbbbbk..",
    ".kbblbbbbdk.",
    "kbbblbbbbddk",
    "kbbblbbbdddk",
    ".kkkkkkkkkk.",
]

ICON_HEART = [
    "............",
    "..kk....kk..",
    ".kbbkkkkbbk.",
    ".kblbbbbbbk.",
    "kblbbbbbbbbk",
    "kbbbbbbbbbbk",
    "kbbbbbbbbbbk",
    ".kbbbbbbbbk.",
    "..kbbbbbbk..",
    "...kbbbbk...",
    "....kbbk....",
    ".....kk.....",
]

ICON_STAR = [
    ".....kk.....",
    ".....kbk....",
    "....kbbk....",
    "kkkkkbbkkkkk",
    "kblbbbbbbbbk",
    ".kbbbbbbbbk.",
    "..kbbbbbbk..",
    "..kbbbbbbk..",
    ".kbbbkkbbbk.",
    ".kbk....kbk.",
    "kk......kk..",
    "............",
]

ICON_TROPHY = [
    "............",
    ".kkkkkkkkkk.",
    ".kblbbbbbbk.",
    "kbkbbbbbbkbk",
    "kbkbbbbbbkbk",
    "kbbkbbbbkbbk",
    ".kkkbbbbkkk.",
    "...kbbbbk...",
    "...kbbbbk...",
    "....kbbk....",
    "...kkbbkk...",
    "..kdkkkkdk..",
]

ICON_BELL = [
    "............",
    ".....kk.....",
    "....kbbk....",
    "...kbbbbk...",
    "..kbllbbk...",
    "..kbllbbk...",
    ".kbbllbbbk..",
    ".kbblllbbk..",
    "kbbbblllbbbk",
    "kbbbbbbbbbbk",
    ".kkkkkkkkkk.",
    "....kbbk....",
]

ICON_SWORD = [
    "..........kk",
    ".........kbk",
    "........kbbk",
    ".......kbbbk",
    "......kbbbk.",
    ".....kbbbk..",
    "..k.kbbbk...",
    "..kkkbbk....",
    "..kdkkk.....",
    ".kdkdkk.....",
    "kdk..kdk....",
    "kk....kk....",
]

ICON_CAMERA = [
    "............",
    "..kkkkkkkk..",
    "..kbbbbbbk..",
    ".kbbbbbbbbk.",
    ".kbbkkkkbbk.",
    "kbbkllllkbbk",
    "kbkbllllkbkk",
    "kbbkllllkbbk",
    ".kbbkkkkbbpk",
    ".kbbbbbbbbk.",
    "..kkkkkkkk..",
    "............",
]

# ============ tabBar 图标（16x16）============
TAB_INACTIVE = (156, 139, 122)
TAB_ACTIVE = (232, 131, 58)

TAB_HOME = [
    "................",
    "................",
    ".......kk.......",
    "......kbbk......",
    ".....kbbbbk.....",
    "....kbbbbbbk....",
    "...kbbbbbbbbk...",
    "..kbbbbbbbbbbk..",
    ".kbbbbbbbbbbbbk.",
    ".kkkkkkkkkkkkkk.",
    "..kbbbkkkkbbbk..",
    "..kbbbkkkkbbbk..",
    "..kbbbk..kbbbk..",
    "..kbbbk..kbbbk..",
    "..kkkkk..kkkkk..",
    "................",
]

TAB_CAT = [
    "................",
    "................",
    "..k..........k..",
    "..kk........kk..",
    "..kkkkkkkkkkkk..",
    "..kbbbbbbbbbbk..",
    "..kbbbbbbbbbbk..",
    "..kbeebbbbeebk..",
    "..kbbbbbbbbbbk..",
    "..kbbllllllbbk..",
    "..kbbblpplbbbk..",
    "..kbbblpllb bbk.".replace(" ", "b"),
    "...kbbbbbbbbk...",
    "...kkbbbbbbkk...",
    ".....kkkkkk.....",
    "................",
]

TAB_SWORD = [
    "............kk..",
    "...........kbk..",
    "..........kbbk..",
    ".........kbbbk..",
    "........kbbbk...",
    ".......kbbbk....",
    "......kbbbk.....",
    "..kk.kbbbk......",
    "...kkkbbk.......",
    "...kdkkk........",
    "..kdkkk.........",
    ".kdk.kdk........",
    "kdk...kdk.......",
    "kk.....kk.......",
    "................",
    "................",
]

TAB_USER = [
    "................",
    "................",
    ".....kkkkkk.....",
    "....kbbbbbbk....",
    "...kbbbbbbbbk...",
    "...kbbbbbbbbk...",
    "...kbeebbeebk...",
    "...kbbbbbbbbk...",
    "....kbbllbbk....",
    ".....kbbbbk.....",
    "......kkkk......",
    "....kkbbbbkk....",
    "...kbbbbbbbbk...",
    "..kbbbbbbbbbbk..",
    "..kkkkkkkkkkkk..",
    "................",
]

TAB_HALL = [
    "..kk............",
    "..kbk...........",
    "..kbkkkkkkkkkk..",
    "..kbbbbbbbbbbk..",
    "..kbbbbbbbbbbk..",
    "..kbbbkbbkbbbk..",
    "..kbbbbbbbbbbk..",
    "..kbkkkkkkkkkk..",
    "..kbk...........",
    "..kbk...........",
    "..kbk...........",
    "..kbkk..........",
    "..kbbbbkk.......",
    "..kkkkkkkk......",
    "................",
    "................",
]


def render(grid, palette, scale):
    h = len(grid)
    w = max(len(r) for r in grid)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y, row in enumerate(grid):
        assert len(row) == w, f"row width mismatch: {row!r} len={len(row)} expect={w}"
        for x, ch in enumerate(row):
            if ch in palette:
                v = palette[ch]
                img.putpixel((x, y), v if len(v) == 4 else (*v, 255))
    return img.resize((w * scale, h * scale), Image.NEAREST)


def save(grid, palette, path, scale=8):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    render(grid, palette, scale).save(path)
    print("saved", os.path.normpath(path))


def main():
    # 猫咪：5 色 x 3 姿态
    poses = {"idle": CAT_IDLE, "happy": CAT_HAPPY, "attack": CAT_ATTACK}
    for color, pal in CAT_PALETTES.items():
        for pose, grid in poses.items():
            save(grid, pal, os.path.join(OUT_DIR, f"cat-{color}-{pose}.png"))
    # BOSS：4 阶段
    bosses = {"slime": BOSS_SLIME, "bat": BOSS_BAT, "ghost": BOSS_GHOST, "demon": BOSS_DEMON}
    for name, grid in bosses.items():
        save(grid, BOSS_PALETTES[name], os.path.join(OUT_DIR, f"boss-{name}.png"))
    # 小图标
    icons = {"coin": ICON_COIN, "flame": ICON_FLAME, "heart": ICON_HEART, "star": ICON_STAR,
             "trophy": ICON_TROPHY, "bell": ICON_BELL, "sword": ICON_SWORD, "camera": ICON_CAMERA}
    for name, grid in icons.items():
        save(grid, ICON_PALETTES[name], os.path.join(OUT_DIR, f"icon-{name}.png"), scale=6)
    # tabBar 图标：两态
    gray_pal = {"k": TAB_INACTIVE, "b": TAB_INACTIVE, "e": (0, 0, 0, 0)}
    active_pal = {"k": TAB_ACTIVE, "b": TAB_ACTIVE, "e": (0, 0, 0, 0)}
    tabs = {"home": TAB_HOME, "cat": TAB_CAT, "sword": TAB_SWORD, "user": TAB_USER, "hall": TAB_HALL}
    for name, grid in tabs.items():
        save(grid, gray_pal, os.path.join(TAB_DIR, f"{name}.png"), scale=5)
        save(grid, active_pal, os.path.join(TAB_DIR, f"{name}-active.png"), scale=5)


if __name__ == "__main__":
    main()
