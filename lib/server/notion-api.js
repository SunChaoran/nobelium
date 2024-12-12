import { NotionAPI } from "notion-client";
import cache from "@/lib/cache";

const { NOTION_ACCESS_TOKEN } = process.env;

const client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN });

/**
 * 获取页面数据，支持缓存
 * @param {string} pageId - 页面 ID
 * @returns {Promise<Object>} 页面数据
 */
async function getPageWithCache(pageId) {
  const cacheKey = `page_${pageId}`;
  const cachedPage = cache.get(cacheKey);
  if (cachedPage) {
    return cachedPage;
  }

  try {
    const page = await client.getPage(pageId);
    cache.set(cacheKey, page); // 默认TTL 5分钟
    return page;
  } catch (error) {
    console.error(`Error fetching page ${pageId}:`, error);
    throw error;
  }
}

/**
 * 获取用户数据，支持缓存
 * @param {Array<string>} userIds - 用户 ID 数组
 * @returns {Promise<Object>} 用户数据
 */
async function getUsersWithCache(userIds) {
  const uniqueUserIds = [...new Set(userIds)];
  const cachedUsers = {};
  const idsToFetch = [];

  uniqueUserIds.forEach((userId) => {
    const cacheKey = `user_${userId}`;
    const cachedUser = cache.get(cacheKey);
    if (cachedUser) {
      cachedUsers[userId] = cachedUser;
    } else {
      idsToFetch.push(userId);
    }
  });

  if (idsToFetch.length > 0) {
    try {
      const fetchedUsers = await client.getUsers(...idsToFetch);
      Object.entries(fetchedUsers.recordMapWithRoles.notion_user || {}).forEach(
        ([key, value]) => {
          const userId = value.value.id;
          const user = {
            id: value.value.id,
            first_name: value.value.given_name,
            last_name: value.value.family_name,
            profile_photo: value.value.profile_photo,
          };
          cachedUsers[userId] = user;
          cache.set(`user_${userId}`, user);
        },
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  return cachedUsers;
}

export { client as default, getPageWithCache, getUsersWithCache };
