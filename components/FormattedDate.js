import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import lang from "dayjs/locale/zh-CN";

dayjs.locale(lang);
dayjs.extend(localizedFormat);

export default function FormattedDate({ date }) {
  return <span>{dayjs(date).format("ll")}</span>;
}
