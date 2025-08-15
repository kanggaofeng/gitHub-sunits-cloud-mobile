import request from '@/utils/request'
import CryptoJS from 'crypto-js'

//获取oss-token
export async function getOssToken() {
  return request({
    url: '/file/sysFile/getOssToken',
    method: 'get',
  })
}

//获取上传的路径和文件名
export async function getOssPathAndName({ uid, moduleName, fileType }) {
  return request({
    url: '/file/sysFile/getOssPathAndName',
    method: 'get',
    params: {
      uid,
      moduleName,
      fileType,
    },
  })
}


// 生成 base64 policy
// expireSeconds: 签名过期时间，单位秒
// dir: 上传目录前缀，如：'test/'
export function getPolicyBase64(expireSeconds = 300, dir) {
	const date = new Date()
	date.setSeconds(date.getSeconds() + expireSeconds)
	const expiration = date.toISOString()
	const policy = {
		expiration,
		conditions: [
			['starts-with', '$key', dir]
		]
	}
	return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(policy)))
}

// 生成签名
export function getSignature(policyBase64,accessKeySecret) {
	return CryptoJS.enc.Base64.stringify(
		CryptoJS.HmacSHA1(policyBase64, accessKeySecret)
	)
}


