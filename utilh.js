function get_lnk(str)
{
 var spc_ind = str.indexOf(" ");
 if (spc_ind == -1) return str;

 var p1 = str.substring(0,spc_ind).trim();
 var p2 = str.substring(spc_ind).trim();

 if (p1 == "#lv") return "https://devx.rf.gd/lv/?l=" + p2;
 if (p1 == "#rt") return "https://devx.rf.gd/" + p2;

 if (p1 == "#g")  return "https://www.google.com.br/search?q=" + p2;
 if (p1 == "#gi") return "https://www.google.com.br/search?tbm=isch&q=" + p2;

 if (p1 == "#y")  return "https://www.youtube.com/watch?v=" + p2;
 if (p1 == "#yv") return "https://www.youtube.com/" + ((p2.startsWith("@")) ? p2 : "c/" + p2) + "/videos";
 if (p1 == "#yp") return "https://www.youtube.com/" + ((p2.startsWith("@")) ? p2 : "c/" + p2) + "/playlists";
 if (p1 == "#ys") return "https://www.youtube.com/" + ((p2.startsWith("@")) ? p2 : "c/" + p2) + "/shorts";
 if (p1 == "#yl") return "https://www.youtube.com/playlist?list=" + p2;

 if (p1 == "#ig") return "https://www.instagram.com/" + p2;

 return "";
}

function get_config(str)
{
 var str_t = str.trim()
 var ind_sep = str_t.search(/,( )*(http|#)/);
 
 if (ind_sep != -1) {
  var lbl = str_t.substring(0,ind_sep).trim();
  var lnk = get_lnk(str_t.substring(ind_sep+1).trim());
  return lnk.startsWith("http") ?  [0, lbl, lnk] : [1, str_t] ;
 }
 
 var lnk_f = get_lnk(str_t);
 return lnk_f.startsWith("http") ? [0, str_t, lnk_f] : [1, str_t];
}

function get_ico_lnk(url_str)
{
 if (url_str == 0) return "/err.png";
 if (url_str == 1) return "/def.png";
 var url = get_url(url_str);
 if (!url) return "";
 if (url.host == location.host) return "/def.png";
 return "https://s2.googleusercontent.com/s2/favicons?sz=32&domain_url=" + url.origin;
}

function get_url(lnk)
{
try {
 var u = new URL(lnk);
 return u;
} catch (_) {
 return null;
}
}

function getp(pn, url) 
{
 var result = "", tmp = [];
 var items = (url==undefined)?location.search.substr(1).split("&"):url.search.substr(1).split("&");
 for (var index = 0; index < items.length; index++) {
 tmp = items[index].split("=");
 if (tmp[0] === pn) result = decodeURIComponent(tmp[1]);
 }
 return result;
}


