from PIL import Image
import sys

def process_favicon(input_path, output_path):
    # Favicon: Option 5 has a white border. Let's find the bounding box of the non-white area.
    img = Image.open(input_path).convert("RGBA")
    
    # Get bounding box of dark area (non-white)
    # Threshold for white
    datas = img.getdata()
    min_x, min_y, max_x, max_y = img.width, img.height, 0, 0
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = img.getpixel((x, y))
            # If not pure white/light (assuming background is light)
            if r < 240 and g < 240 and b < 240:
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
    if min_x < max_x and min_y < max_y:
        # add a small padding
        padding = 10
        min_x = max(0, min_x - padding)
        min_y = max(0, min_y - padding)
        max_x = min(img.width, max_x + padding)
        max_y = min(img.height, max_y + padding)
        
        cropped = img.crop((min_x, min_y, max_x, max_y))
        
        # also make any pure white transparent just in case
        c_datas = cropped.getdata()
        new_data = []
        for item in c_datas:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        cropped.putdata(new_data)
        
        # Resize to something reasonable for favicon
        cropped = cropped.resize((192, 192), Image.Resampling.LANCZOS)
        cropped.save(output_path, "PNG")
        print("Favicon processed and saved to", output_path)

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Make white transparent
    for item in datas:
        # Change all white (also shades of whites)
        # to transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    # Crop to bounding box
    min_x, min_y, max_x, max_y = img.width, img.height, 0, 0
    for y in range(img.height):
        for x in range(img.width):
            if img.getpixel((x, y))[3] > 0: # not transparent
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
    if min_x < max_x and min_y < max_y:
        cropped = img.crop((min_x, min_y, max_x, max_y))
        
        # Change color to the new cheerful color theme (e.g. #ff6b81 for the logo or keep dark grey #3a2e30)
        # The user's prompt said dark grey, but we can change it to the --ink color (#3a2e30). 
        # But it's already dark grey. Let's just keep it as is, or we can tint it.
        # Actually just keeping it transparent is good enough.
        cropped = cropped.resize((256, int(256 * (max_y - min_y) / (max_x - min_x))), Image.Resampling.LANCZOS)
        cropped.save(output_path, "PNG")
        print("Logo processed and saved to", output_path)

process_favicon('/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/hyper_minimal_square_1786245896785.png', 'frontend/public/favicon.png')
process_logo('/Users/auf/.gemini/antigravity-ide/brain/cd7a969e-f4f0-4c20-a4ef-4c3d476d2479/hyper_minimal_positive_m_1786246085179.png', 'frontend/public/logo.png')

