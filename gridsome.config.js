require("ts-node/register");

// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const { VuetifyLoaderPlugin } = require("vuetify-loader");
const { DateTime, FixedOffsetZone } = require("luxon");
const { default: slugify } = require("slugify");

const siteName = "David Driscoll";
const siteHostname = "www.daviddriscoll.me";
const siteDescription = "export type Blog = 'typescript' & '.net' & 'more'";
// const siteDescription = "Ramblings of a Software Developer";

const { linkIcon, externalLinkIcon } = (() => {
  const faLinkIcon = require("@fortawesome/pro-duotone-svg-icons/faLink");
  const faExternalLinkIcon = require("@fortawesome/pro-duotone-svg-icons/faExternalLinkSquareAlt");
  const { icon, toHtml } = require("@fortawesome/fontawesome-svg-core");
  const parse5 = require("parse5");
  const fromParse5 = require("hast-util-from-parse5");

  const i = icon(faLinkIcon.faLink, { classes: "v-icon mr-2" });
  const i2 = icon(faExternalLinkIcon.faExternalLinkSquareAlt, { classes: "" });

  return {
    linkIcon: fromParse5(parse5.parseFragment(toHtml(i.abstract[0]))),
    externalLinkIcon: fromParse5(parse5.parseFragment(toHtml(i2.abstract[0]))),
  };
})();
console.log(linkIcon);
console.log(externalLinkIcon);

const today = DateTime.fromJSDate(new Date(), { zone: FixedOffsetZone.utcInstance });

/** @type import('@tyankatsu0105/types-gridsome').Config */
module.exports = {
  siteName: siteName,
  siteUrl: "https://" + siteHostname,
  siteDescription,
  metadata: {
    author: {
      username: "David Driscoll",
      name: "David Driscoll",
      firstName: "David",
      lastName: "Driscoll",
      twitter: "@david_dotnet",
      email: "david.driscoll@gmail.com"
    },
    build: {
      today: today.toJSDate(),
      year: today.year,
      month: today.month,
      day: today.day,
      monthOfYear: today.monthLong,
      dayOfWeek: today.toFormat("cccc"),
    },
  },

  permalinks: {
    slugify: function (text) {
      // console.log("slugging", text);
      return slugify(text, { strict: true });
    },
  },

  configureWebpack: {
    plugins: [new VuetifyLoaderPlugin()],
  },
  plugins: [
    {
      use: "gridsome-plugin-typescript",
    },

    {
      use: "@gridsome/source-filesystem",
      options: {
        typeName: "Series",
        path: "series/**/*.yml",
        /*
        refs: {
              // Reference to existing authors by id.
              author: 'Author',
              // Create a Tag content type and its nodes automatically.
              tags: {
                typeName: 'Tag',
                create: true
              }
            }
            */
      },
    },

    // {
    //   use: "@gridsome/vue-remark",
    //   options: {
    //     typeName: "BlogPost", // Required
    //     baseDir: "./posts", // Where .md files are located
    //     template: "./src/templates/BlogPost.vue", // Optional
    //     route: "/blog/:year/:month/:day/:slug",

    //     refs: {
    //       series: "Series",
    //       tags: {
    //         typeName: "Tag",
    //         create: true,
    //       },
    //     },
    //   },
    // },

    {
      use: "@gridsome/source-filesystem",
      options: {
        typeName: "BlogPost",
        path: "./posts/**/*.md",

        refs: {
          series: "Series",
          tags: {
            typeName: "Tag",
            create: true,
          },
        },
      },
    },
    {
      use: "@gridsome/source-filesystem",
      options: {
        typeName: "BlogPost",
        path: "./drafts/**/*.md",

        refs: {
          series: "Series",
          tags: {
            typeName: "Tag",
            create: true,
          },
        },
      },
    },

    // {
    //   use: "@gridsome/source-filesystem",
    //   options: {
    //     typeName: "BlogPost",
    //     path: "posts/**/*.md",
    //     /*
    //     refs: {
    //           // Reference to existing authors by id.
    //           author: 'Author',
    //           // Create a Tag content type and its nodes automatically.
    //           tags: {
    //             typeName: 'Tag',
    //             create: true
    //           }
    //         }
    //         */
    //   },
    // },
    // {
    //   use: "gridsome-plugin-recommender",
    //   options: {
    //     enabled: true,
    //     typeName: "BlogPost",
    //     field: "title",
    //     relatedFieldName: "related",
    //     minScore: 0.01,
    //     maxScore: 1,
    //     minRelations: 3,
    //     maxRelations: 10,
    //     fillWithRandom: false,
    //     debug: false,
    //   },
    // },
    // todo flex search

    {
      use: "@gridsome/plugin-sitemap",
      options: {
        config: {
          "/blog/*": {
            changefreq: "weekly",
            priority: 0.5,
          },
        },
      },
    },

    {
      use: "gridsome-plugin-robots-txt",
      options: {
        host: "https://" + siteHostname,
        sitemap: "https://" + siteHostname + "/sitemap.xml",
        policy: [
          {
            userAgent: "Googlebot",
            allow: "/",
            disallow: "/search",
            crawlDelay: 2,
          },
          {
            userAgent: "*",
            allow: "/",
            disallow: "/search",
            crawlDelay: 10,
            cleanParam: "ref /blog/",
          },
        ],
      },
    },
  ],
  templates: {
    // BlogPost: "/blog/:year/:month/:day/:title",
    Tag: "/tags/:title",
  },
  transformers: {
    remark: {
      squeezeParagraphs: false,
      externalLinks: false,
      plugins: [
        [require("./blockquote"), {  }],
        ["remark-slug", {}],
        // [
        //   "remark-autolink-headings",
        //   {
        //     // behavior: 'wrap', //prepend append wrap before after
        //     content: linkIcon,
        //     linkProperties: { ariaHidden: true, tabIndex: -1, className: "anchor" },
        //   },
        // ],
        [
          require("remark-external-links"),
          {
            content: externalLinkIcon,
            contentProperties: { ariaHidden: true, tabIndex: -1, className: "external-link" },
          },
        ],
        [require("./github-links"), { token: process.env.GITHUB_TOKEN || "" }],
        [require("./code-highlighting"), { skipInline: true }],
        ["remark-emoji", { emoticon: true }],
        // ['remark-github', {}],
      ],
      // https://webstone.info/documentation/gridsome-plugin-remark-embed/
      /*
            [ '@noxify/gridsome-plugin-remark-embed', {
                'enabledProviders' : ['Youtube', 'Twitter', 'Gist'],
            }]
             */
    },
  },
  prefetch: { mask: "^$" },
};
