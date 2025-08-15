const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 1. 读取 iconfont.js
const iconfontJsPath = path.join(__dirname, 'iconfont.js');
const content = fs.readFileSync(iconfontJsPath, 'utf-8');

// 2. 提取 <symbol> 标签
const symbolRegex = /<symbol\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g;

const multiColorCss = [];
const multiColorIcons = []; // 记录多色图标 id

// 通用样式
const commonMultiColorCss = `
.t-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}
`;

let match;
while ((match = symbolRegex.exec(content)) !== null) {
	const id = match[1];
	const body = match[2];

	// 用 cheerio 解析 SVG 内容，提取所有 path 的 fill
	const $ = cheerio.load(body, { xmlMode: true });
	const fillColors = [];

	$('path').each((_, el) => {
		const fill = $(el).attr('fill');
		if (fill) {
			fillColors.push(fill.toLowerCase());
		}
	});

	const uniqueColors = [...new Set(fillColors)];
	const isMultiColor = uniqueColors.length > 1;

	if (isMultiColor) {
		multiColorIcons.push(id);

		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="${id}">${body}</svg>`;
		const svgBase64 = encodeURIComponent(svg)
			.replace(/'/g, '%27')
			.replace(/"/g, '%22')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29');

		multiColorCss.push(`
.t-${id} {
  background: url("data:image/svg+xml,${svgBase64}") no-repeat center center;
  background-size: 100%;
}
`);
	}
}

// 3. 写入多色 CSS 文件
fs.writeFileSync(
	path.join(__dirname, 'iconfont-webapp-icon.css'),
	commonMultiColorCss + '\n' + multiColorCss.join('\n')
);

// 4. 修改 iconfont.css，删除多色图标对应的 `.icon-xxx:before`
const originIconfontCssPath = path.join(__dirname, 'iconfont.css');
if (fs.existsSync(originIconfontCssPath)) {
	let originCss = fs.readFileSync(originIconfontCssPath, 'utf-8');

	multiColorIcons.forEach(id => {
		const cssId = id.replace(/^icon-/, '');
		const regex = new RegExp(`\\.icon-${cssId}:before\\s*\\{[^}]*\\}`, 'g');
		originCss = originCss.replace(regex, '');
	});

	// 清理多余空行
	originCss = originCss.replace(/\n\s*\n/g, '\n');

	fs.writeFileSync(originIconfontCssPath, originCss, 'utf-8');
	console.log('🧹 已清理 iconfont.css 中的多色图标 class');
}

// 5. 清理无关文件
const allowedExts = ['.svg', '.ttf', '.woff', '.woff2', '.css', '.js'];
const files = fs.readdirSync(__dirname);

files.forEach(file => {
	const filePath = path.join(__dirname, file);
	const ext = path.extname(file);
	const isDemoCss = file.toLowerCase() === 'demo.css';

	if (fs.statSync(filePath).isFile() && (!allowedExts.includes(ext) || isDemoCss)) {
		fs.unlinkSync(filePath);
		console.log(`🗑️ 已删除文件：${file}`);
	}
});

console.log('✅ 所有任务完成！');
