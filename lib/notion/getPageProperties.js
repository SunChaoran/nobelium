import { getTextContent, getDateValue } from "notion-utils";
import { getUsersWithCache } from "@/lib/server/notion-api";

/**
 * 获取页面属性
 * @param {string} id - 页面 ID
 * @param {Object} block - 块数据
 * @param {Object} schema - 模式数据
 * @returns {Promise<Object>} 处理后的页面属性对象
 */
async function getPageProperties(id, block, schema) {
  const rawProperties = Object.entries(block?.[id]?.value?.properties || {});
  const excludeProperties = ["date", "select", "multi_select", "person"];
  const properties = { id };

  for (const [key, val] of rawProperties) {
    const schemaProperty = schema[key];
    if (!schemaProperty) continue;

    const { type, name } = schemaProperty;

    if (type && !excludeProperties.includes(type)) {
      properties[name] = getTextContent(val);
    } else {
      switch (type) {
        case "date":
          properties[name] = processDateProperty(val);
          break;
        case "select":
        case "multi_select":
          properties[name] = processSelectProperty(val);
          break;
        case "person":
          properties[name] = await processPersonProperty(val);
          break;
        default:
          break;
      }
    }
  }

  return properties;
}

/**
 * 处理日期属性
 * @param {any} val - 原始日期值
 * @returns {Object} 处理后的日期对象
 */
function processDateProperty(val) {
  const dateProperty = getDateValue(val);
  delete dateProperty.type;
  return dateProperty;
}

/**
 * 处理选择属性（select 和 multi_select）
 * @param {any} val - 原始选择值
 * @returns {Array<string>} 选择项数组
 */
function processSelectProperty(val) {
  const selects = getTextContent(val);
  return selects[0]?.length ? selects.split(",") : [];
}

/**
 * 处理人员属性
 * @param {Array<Array<any>>} val - 原始人员值
 * @returns {Promise<Array<Object>>} 处理后的用户数组
 */
async function processPersonProperty(val) {
  const rawUsers = val.flat();
  const userIds = rawUsers.map((user) => user[0][1]).filter((userId) => userId);

  if (userIds.length === 0) return [];

  const users = await getUsersWithCache(userIds);
  return Object.values(users);
}

export { getPageProperties as default };
