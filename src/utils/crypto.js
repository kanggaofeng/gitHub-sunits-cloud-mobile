// utils/crypto.js
import CryptoJS from 'crypto-js'

// 自定义加密密钥（务必保密）
const SECRET_KEY = 'XyyMyyLyyFyyRmmHtlHtlXhh20250604' // 长度需为 16、24 或 32 字节
const SECRET_IV = '20250604!QAZ@WSX' // 初始向量，同样长度需为 16 字节

// AES加密
export function encrypt(text) {
	const key = CryptoJS.enc.Utf8.parse(SECRET_KEY)
	const iv = CryptoJS.enc.Utf8.parse(SECRET_IV)
	const encrypted = CryptoJS.AES.encrypt(text, key, {
		iv,


		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	})
	return encrypted.toString()
}

// AES解密
export function decrypt(ciphertext) {
	const key = CryptoJS.enc.Utf8.parse(SECRET_KEY)
	const iv = CryptoJS.enc.Utf8.parse(SECRET_IV)
	const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	})
	return decrypted.toString(CryptoJS.enc.Utf8)
}
