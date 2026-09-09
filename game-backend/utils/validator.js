const url =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

class Validator {
  static retweetURL(str = "") {
    return !!str.match(/https:\/\/x.com\/.+status\//);
  }

  static discordInviteURL(url) {
    return (
      url.includes("https://discord.com/invite/") ||
      url.includes("https://discord.gg/")
    );
  }

  static date(str = "") {
    if (typeof str == "string") str = str.trim();
    if (!str) return false;

    if (isNaN(str)) {
      if (str.indexOf("T")) {
        var [date, time] = str.split("T");
      } else if (str.indexOf(",")) {
        // eslint-disable-next-line no-redeclare
        var [date, time] = str.split(",");
      } else {
        // eslint-disable-next-line no-redeclare
        var [date, time] = str.split(" ");
      }
      if (!time) {
        time = "";
      } else {
        time = time.trim();
      }

      if (date.indexOf(".") > 0) date = date.split(".").reverse().join("-");

      str = (date + " " + time).trim();
    } else {
      str = parseInt(str);
    }

    var res = new Date(str);
    return res != "Invalid Date";
  }

  static url(website) {
    return !!website.match(url);
  }

  static email(str = "") {
    return !!str.match(
      /^\w+(([\.\-\_\+\w]+)\w+)*@([\w\-\_\+]+)+([\.\-\_\+]?\w+)*(\.\w{2,10})+$/
    );
  }
}

module.exports = Validator;
