Shop page source. Rebuild the home page with:
    node src/mkshop.js '' index.html
then re-add this line right after <head> in index.html (keeps Alison's old QR links working):
    <script>if(/^#week-\d/.test(location.hash))location.replace("alison/"+location.hash);</script>
