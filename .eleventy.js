module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("style.css");
    eleventyConfig.addPassthroughCopy("script.js");
    return {
        pathPrefix: "/booksofdisquiet/",
        dir: {
            input: ".",
            output: "_site"
        }
    };
};
