"""Генерирует PNG-иконки PWA без внешних зависимостей.

Запуск: .venv\\Scripts\\python api\\scripts\\make_icons.py
"""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "web" / "static" / "web" / "icons"

NAVY = (18, 58, 99, 255)
MINT = (15, 155, 142, 255)
GOLD = (217, 162, 39, 255)
TRANSPARENT = (0, 0, 0, 0)


def write_png(path: Path, width: int, height: int, pixels: list[list[tuple[int, int, int, int]]]) -> None:
    raw = b"".join(
        b"\x00" + bytes(channel for pixel in row for channel in pixel) for row in pixels
    )

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def rounded_mask(x: float, y: float, size: int, radius: float) -> bool:
    if x < radius and y < radius:
        return (x - radius) ** 2 + (y - radius) ** 2 <= radius**2
    if x > size - radius and y < radius:
        return (x - (size - radius)) ** 2 + (y - radius) ** 2 <= radius**2
    if x < radius and y > size - radius:
        return (x - radius) ** 2 + (y - (size - radius)) ** 2 <= radius**2
    if x > size - radius and y > size - radius:
        return (x - (size - radius)) ** 2 + (y - (size - radius)) ** 2 <= radius**2
    return True


def render(size: int, padding_ratio: float = 0.0) -> list[list[tuple[int, int, int, int]]]:
    pixels: list[list[tuple[int, int, int, int]]] = []
    radius = size * 0.24
    center = size / 2
    roof_half = size * 0.22
    roof_top = size * 0.34
    roof_bottom = size * 0.52
    base_y = size * 0.7
    thickness = max(2.0, size * 0.028)
    dot_radius = size * 0.082
    pad = size * padding_ratio

    for y in range(size):
        row: list[tuple[int, int, int, int]] = []
        for x in range(size):
            fx, fy = x + 0.5, y + 0.5
            if fx < pad or fy < pad or fx > size - pad or fy > size - pad:
                row.append(TRANSPARENT)
                continue
            if not rounded_mask(fx, fy, size, radius):
                row.append(TRANSPARENT)
                continue

            color = NAVY

            # Контур «дома»: две диагонали крыши и две вертикали
            inside_roof = (
                roof_top - thickness <= fy <= roof_bottom + thickness
                and abs(fx - center) <= roof_half * (fy - roof_top) / (roof_bottom - roof_top) + thickness
            )
            left_wall = abs(fx - (center - roof_half)) <= thickness and roof_bottom <= fy <= base_y
            right_wall = abs(fx - (center + roof_half)) <= thickness and roof_bottom <= fy <= base_y

            if inside_roof or left_wall or right_wall:
                color = MINT

            # Золотая точка в центре
            if (fx - center) ** 2 + (fy - size * 0.5) ** 2 <= dot_radius**2:
                color = GOLD

            row.append(color)
        pixels.append(row)
    return pixels


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    targets = [
        ("icon-192.png", 192, 0.0),
        ("icon-512.png", 512, 0.0),
        ("icon-maskable-512.png", 512, 0.12),
        ("apple-touch-icon.png", 180, 0.0),
    ]
    for name, size, padding in targets:
        write_png(OUT_DIR / name, size, size, render(size, padding))
        print(f"written {name} ({size}x{size})")


if __name__ == "__main__":
    main()
