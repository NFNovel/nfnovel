module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nfnovels_dark: {
          DEFAULT: "#030303",
          search_form: "#1a1a1a",
          search_text: "#272738",
        },
        nfnovels_border: {
          DEFAULT: "#343536",
        },
        nfnovels_page: {
          form: "#1a1a1a",
          text: "#272738",
        },
        nfnovels_text: {
          DEFAULT: "rgb(215, 218, 220)",
          darker: "#818384",
        },
      },
    },
  },
  plugins: [],
};
