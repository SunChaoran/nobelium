import { getPageWithCache } from "@/lib/server/notion-api";

/**
 * 获取指定页面的块数据，使用缓存优化
 * @param {string} id - 页面 ID
 * @returns {Promise<Object>} 页面块数据
 */
export async function getPostBlocks(id) {
  try {
    return await getPageWithCache(id);
  } catch (error) {
    console.error(`Error fetching post blocks for page ID ${id}:`, error);
    throw error;
  }
}
