/**
 * 过滤发布的帖子（可选包括页面）
 * @param {Object} params - 参数对象
 * @param {Array<Object>} params.posts - 待过滤的帖子数组
 * @param {boolean} params.includePages - 是否包含页面
 * @returns {Array<Object>} 过滤后的帖子数组
 */
export default function filterPublishedPosts({ posts, includePages }) {
  if (!Array.isArray(posts) || posts.length === 0) return [];

  return posts.filter((post) => {
    const { type, title, slug, status, date } = post;

    // 检查帖子类型
    const isValidType = includePages
      ? type?.[0] === "Post" || type?.[0] === "Page"
      : type?.[0] === "Post";

    if (!isValidType) {
      return false;
    }

    // 检查必需的属性
    if (!title || !slug) {
      return false;
    }

    // 检查状态是否为发布且日期有效
    const isPublished = status?.[0] === "Published";
    const isDateValid = date <= Date.now(); // 使用时间戳进行比较

    return isPublished && isDateValid;
  });
}
