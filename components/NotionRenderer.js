import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { NotionRenderer as Renderer } from "react-notion-x";
import { getTextContent } from "notion-utils";
import PropTypes from "prop-types";

import Toggle from "@/components/notion-blocks/Toggle";
import Loading from "@/components/Loading";
import { FONTS_SANS, FONTS_SERIF } from "@/consts";
import { useConfig } from "@/lib/config";

const prismLanguageMap = {
  javascript: "javascript",
  js: "javascript",
  jsx: "jsx",
  typescript: "typescript",
  ts: "typescript",
  python: "python",
  java: "java",
  "markup-templating": "markup-templating",
  markup: "markup",
  html: "markup",
  xml: "markup",
  // 'plain text': "markdown",
  bash: "bash",
  shell: "bash",
  c: "c",
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  csharp: "csharp",
  docker: "docker",
  "js-templates": "js-templates",
  coffeescript: "coffeescript",
  diff: "diff",
  git: "git",
  go: "go",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  rust: "rust",
  scala: "scala",
  graphql: "graphql",
  css: "css",
  scss: "scss",
  handlebars: "handlebars",
  less: "less",
  json: "json",
  makefile: "makefile",
  markdown: "markdown",
  objectivec: "objectivec",
  ocaml: "ocaml",
  reason: "reason",
  sass: "sass",
  solidity: "solidity",
  sql: "sql",
  stylus: "stylus",
  wasm: "wasm",
  yaml: "yaml",
};

const DynamicMermaid = dynamic(
  () => import("@/components/notion-blocks/Mermaid"),
  { ssr: false },
);

const DynamicCode = dynamic(
  () =>
    import("react-notion-x/build/third-party/code").then(
      (_module) => _module.Code,
    ),
  { ssr: false },
);

const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (_module) => _module.Collection,
  ),
);

const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then(
    (_module) => _module.Equation,
  ),
);

const Pdf = dynamic(
  () =>
    import("react-notion-x/build/third-party/pdf").then(
      (_module) => _module.Pdf,
    ),
  { ssr: false },
);

const Tweet = dynamic(() =>
  import("react-tweet-embed").then((_module) => {
    const { default: TweetEmbed } = _module;
    return function TweetComponent({ id }) {
      return <TweetEmbed tweetId={id} options={{ theme: "dark" }} />;
    };
  }),
);

const loadedLanguages = new Set();

const loadPrismLanguage = async (language) => {
  const prismLang = prismLanguageMap[language.toLowerCase()];
  if (!prismLang) {
    console.warn(`Code Renderer 不支持的语言: ${language}`);
    return;
  }
  if (loadedLanguages.has(prismLang)) {
    return;
  }
  try {
    await import(`prismjs/components/prism-${prismLang}.js`);
    loadedLanguages.add(prismLang);
  } catch (error) {
    console.error(`加载语言失败: ${prismLang}`, error);
  }
};

function CodeSwitch(props) {
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const language = getTextContent(props.block.properties.language);

  useEffect(() => {
    let isMounted = true;

    const loadLanguage = async () => {
      if (language && language !== "Mermaid") {
        await loadPrismLanguage(language);
      }
      if (isMounted) {
        setIsLanguageLoaded(true);
      }
    };

    loadLanguage();

    return () => {
      isMounted = false;
    };
  }, [language]);

  if (language === "Mermaid") {
    return <DynamicMermaid {...props} />;
  }

  if (!isLanguageLoaded) {
    return <Loading />;
  }

  return <DynamicCode {...props} />;
}

const Code = dynamic(() => Promise.resolve(CodeSwitch), { ssr: false });

const components = {
  Code,
  Collection,
  Equation,
  Pdf,
  Tweet,
  toggle_nobelium: ({ block, children }) => (
    <Toggle block={block}>{children}</Toggle>
  ),
};

const mapPageUrl = (id) => `https://www.notion.so/${id.replace(/-/g, "")}`;

const mapBlockTypes = (recordMap) => {
  if (!recordMap || !recordMap.block) return;

  Object.values(recordMap.block).forEach(({ value: block }) => {
    if (block?.type === "toggle") {
      block.type = "toggle_nobelium";
    }
  });
};

export default function NotionRenderer(props) {
  const config = useConfig();
  const font = config.font === "serif" ? FONTS_SERIF : FONTS_SANS;

  useEffect(() => {
    mapBlockTypes(props.recordMap);
  }, [props.recordMap]);

  return (
    <>
      <style jsx global>{`
        :root {
          --font-family: ${font};
        }
      `}</style>
      <Renderer components={components} mapPageUrl={mapPageUrl} {...props} />
    </>
  );
}

NotionRenderer.propTypes = {
  recordMap: PropTypes.object.isRequired,
};
