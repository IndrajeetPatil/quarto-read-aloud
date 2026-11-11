library(hexSticker)
library(magick)
library(showtext)

google_font_name <- "Rubik"
font_add_google(google_font_name)

showtext_auto()

img <- image_read("hextools/data.svg", density = 192)

sticker(
    img,
    package = "quarto-read-aloud",
    p_color = "#1D3B53",
    p_family = google_font_name,
    p_size = 24,
    p_x = 1,
    p_y = 1.42,
    s_x = 1,
    s_y = 0.83,
    s_width = 1.3,
    s_height = 0.9,
    h_color = "#447099",
    filename = "docs/images/logo.png",
    h_fill = "white",
    url = "https://github.com/IndrajeetPatil/quarto-read-aloud",
    u_x = 0.97,
    u_size = 5.5,
    u_color = "grey",
    dpi = 600
)
