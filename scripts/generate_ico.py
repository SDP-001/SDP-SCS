from PIL import Image

src = Image.open('public/icon-512.png')
# Save multi-resolution Windows icon
src.save(
    'public/nec-portal.ico',
    format='ICO',
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
)
print("Generated public/nec-portal.ico with all Windows sizes!")

