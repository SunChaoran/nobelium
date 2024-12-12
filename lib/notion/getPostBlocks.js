// lib/server/getPostBlocks.js
import { getPageWithCache } from "@/lib/server/notion-api";

/**
 * 获取指定页面的块数据，使用缓存优化
 * @param {string} id - 页面 ID
 * @returns {Promise<Object>} 页面块数据
 */
export async function getPostBlocks(id) {
  console.time("getPostBlocks");

  try {
    const pageBlock = await getPageWithCache(id);
    console.timeEnd("getPostBlocks");
    return pageBlock;
  } catch (error) {
    console.error(`Error fetching post blocks for page ID ${id}:`, error);
    console.timeEnd("getPostBlocks");
    throw error; // 根据需求，可以选择抛出错误或返回默认值
  }
}
