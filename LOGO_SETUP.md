# NABD Logo Setup

## Instructions

1. **Save the logo image**: Download the NABD logo image from the attachment and save it as `nabd-logo.png` in this folder (`Normal Files/`)
   - The image should be PNG format
   - Recommended size: 150x150 pixels or larger
   - The navbar will automatically display it at 40px height

2. **Favicon**: The same logo image is also set as the browser tab favicon
   - Browsers will cache this image

3. **Bilingual Hospital Names**: 
   - Hospital names are now automatically displayed in English or Arabic based on the selected language
   - The mapping is defined in `hospital-names.js`
   - All cards, modals, and list views will show the correct language

## Files Modified

- `index.html` - Added favicon link, hospital-names.js script, and navbar logo image
- `script.js` - Updated renderGrid() and openDetail() to use bilingual names
- `hospital-names.js` - New file with English-Arabic hospital name mappings

## Testing

1. Open the HTML file in your browser
2. Verify the logo appears in the navbar
3. Switch between English and Arabic languages
4. Hospital names should change accordingly
5. Check browser tab - the favicon should appear
