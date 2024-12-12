// lib/server/getAllPosts.js
import { config as BLOG } from "@/lib/server/config";
import { idToUuid } from "notion-utils";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { getPageWithCache } from "@/lib/server/notion-api";
import getAllPageIds from "./getAllPageIds";
import getPageProperties from "./getPageProperties";
import filterPublishedPosts from "./filterPublishedPosts";

dayjs.extend(timezone);

/**
 * 检查页面是否为数据库类型
 * @param {Object} rawMetadata - 原始元数据
 * @returns {boolean}
 */
const isDatabase = (rawMetadata) => {
  const validTypes = ["collection_view_page", "collection_view"];
  return validTypes.includes(rawMetadata?.type);
};

/**
 * 转换日期为 Unix 毫秒时间戳
 * @param {Object} properties - 页面属性
 * @param {Object} block - 块数据
 * @param {string} id - 页面 ID
 * @returns {number}
 */
const convertDate = (properties, block, id) => {
  const startDate = properties.date?.start_date;
  const createdTime = block[id].value?.created_time;

  return dayjs(startDate ? dayjs.tz(startDate) : dayjs(createdTime)).valueOf();
};

/**
 * 获取并处理单个页面的属性
 * @param {string} pageId - 页面 ID
 * @param {Object} block - 块数据
 * @param {Object} schema - 模式数据
 * @returns {Promise<Object|null>}
 */
const processPage = async (pageId, block, schema) => {
  try {
    const properties = await getPageProperties(pageId, block, schema);
    if (!properties) {
      return null;
    }
    properties.fullWidth =
      block[pageId].value?.format?.page_full_width ?? false;
    properties.date = convertDate(properties, block, pageId);

    return properties;
  } catch (error) {
    console.error(`Error processing page ${pageId}:`, error);
    return null;
  }
};

/**
 * 获取所有发布的帖子（可选包括页面）
 * @param {Object} options - 选项参数
 * @param {boolean} options.includePages - 是否包含页面
 * @returns {Promise<Array<Object>>|null}
 */
export async function getAllPosts({ includePages = false }) {
  const notionPageId = idToUuid(process.env.NOTION_PAGE_ID);

  try {
    console.time("getAllPosts");
    // 使用缓存后的 API 调用
    const response = await getPageWithCache(notionPageId);
    console.timeEnd("getAllPosts");

    const collection = Object.values(response.collection)[0]?.value;
    const collectionQuery = response.collection_query;
    const block = response.block;
    const schema = collection?.schema;

    const rawMetadata = block[notionPageId]?.value;

    if (!isDatabase(rawMetadata)) {
      console.log(`pageId "${notionPageId}" is not a database`);
      return null;
    }

    const pageIds = getAllPageIds(collectionQuery);

    console.time("processPages");
    const processedPages = await Promise.all(
      pageIds.map((pageId) => processPage(pageId, block, schema)),
    );
    console.timeEnd("processPages");

    // 过滤掉处理失败的页面
    const validPages = processedPages.filter((page) => page !== null);

    const filteredPosts = filterPublishedPosts({
      posts: validPages,
      includePages,
    });

    // 根据日期排序
    if (BLOG.sortByDate) {
      filteredPosts.sort((a, b) => b.date - a.date);
    }

    return filteredPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
}
