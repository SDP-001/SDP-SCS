import os
from PIL import Image

# Load the source logo
src_path = 'public/nec-logo.png'
logo = Image.open(src_path).convert("RGBA")

def create_square_icon(size: int, is_maskable: bool = False, bg_color=(15, 23, 42, 255)): # #0F172A slate-900
    # Create background canvas
    canvas = Image.new("RGBA", (size, size), bg_color)
    
    # Calculate fit size with padding
    # For maskable icons, Google recommends safe area of 80% (10% padding on all sides)
    pad_ratio = 0.70 if is_maskable else 0.82
    max_w = int(size * pad_ratio)
    max_h = int(size * pad_ratio)
    
    # Resize preserving aspect ratio
    w, h = logo.size
    ratio = min(max_w / w, max_h / h)
    new_w = int(w * ratio)
    new_h = int(h * ratio)
    
    resized_logo = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center paste
    pos_x = (size - new_w) // 2
    pos_y = (size - new_h) // 2
    
    canvas.paste(resized_logo, (pos_x, pos_y), resized_logo)
    return canvas

# 1. 192x192 regular icon
icon_192 = create_square_icon(192, is_maskable=False)
icon_192.save('public/icon-192.png', 'PNG')

# 2. 512x512 regular icon
icon_512 = create_square_icon(512, is_maskable=False)
icon_512.save('public/icon-512.png', 'PNG')

# 3. 192x192 maskable icon (for Android adaptive icons)
maskable_192 = create_square_icon(192, is_maskable=True)
maskable_192.save('public/icon-maskable-192.png', 'PNG')

# 4. 512x512 maskable icon
maskable_512 = create_square_icon(512, is_maskable=True)
maskable_512.save('public/icon-maskable-512.png', 'PNG')

# 5. 180x180 Apple Touch Icon (iOS home screen)
apple_icon = create_square_icon(180, is_maskable=True)
apple_icon.save('public/apple-touch-icon.png', 'PNG')

# 6. Also 180x180 for apple-icon.png in Next.js
apple_icon.save('public/apple-icon.png', 'PNG')

print("Generated all PWA icons successfully:")
for name in ['icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'apple-icon.png']:
    im = Image.open(os.path.join('public', name))
    print(f"  {name}: {im.size} {im.format}")

