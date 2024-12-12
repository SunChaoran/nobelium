import { idToUuid } from "notion-utils";

/**
 * 获取所有页面的 ID
 * @param {Object} collectionQuery - Collection 查询对象
 * @param {string} [viewId] - 可选的视图 ID
 * @returns {Array<string>} 页面 ID 数组
 */
export default function getAllPageIds(collectionQuery, viewId) {
  if (!collectionQuery || typeof collectionQuery !== "object") {
    console.error("Invalid collectionQuery provided.");
    return [];
  }

  const viewsArray = Object.values(collectionQuery);
  if (viewsArray.length === 0) {
    console.warn("No views found in collectionQuery.");
    return [];
  }

  const views = viewsArray[0];
  if (!views || typeof views !== "object") {
    console.error("Invalid views structure in collectionQuery.");
    return [];
  }

  return viewId
    ? getPageIdsByView(views, viewId)
    : getAllPageIdsFromViews(views);
}

/**
 * 获取指定视图下的页面 ID
 * @param {Object} views - 视图对象
 * @param {string} viewId - 视图 ID
 * @returns {Array<string>} 页面 ID 数组
 */
function getPageIdsByView(views, viewId) {
  const uuidViewId = idToUuid(viewId);
  if (!uuidViewId) {
    console.error(`Invalid viewId provided: ${viewId}`);
    return [];
  }

  const view = views[uuidViewId];
  if (!view || !Array.isArray(view.blockIds)) {
    console.warn(`No blockIds found for viewId: ${viewId}`);
    return [];
  }

  return view.blockIds;
}

/**
 * 获取所有视图中的页面 ID
 * @param {Object} views - 视图对象
 * @returns {Array<string>} 页面 ID 数组
 */
function getAllPageIdsFromViews(views) {
  const pageIdSet = new Set();

  Object.values(views).forEach((view) => {
    if (
      view &&
      view.collection_group_results &&
      Array.isArray(view.collection_group_results.blockIds)
    ) {
      view.collection_group_results.blockIds.forEach((id) => pageIdSet.add(id));
    }
  });

  return Array.from(pageIdSet);
}
