// 在浏览器中执行：将canvas保存为PNG下载
const canvas = document.querySelector("canvas");
if (canvas) {
    const link = document.createElement("a");
    link.download = "render-from-browser.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    "saved";
} else {
    "no canvas";
}
