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

function get_p(pn, url) 
{
 var result = "", tmp = [];
 var items = (url) ? url.search.substr(1).split("&") : location.search.substr(1).split("&");
 for (var index = 0; index < items.length; index++) {
 tmp = items[index].split("=");
 if (tmp[0] === pn) result = decodeURIComponent(tmp[1]);
 }
 return result;
}

function ajax_r(url, args, fn_suc, hdrs, tp_res)
{
 var xhr = new XMLHttpRequest();

 if (!tp_res || tp_res.startsWith("j")) xhr.responseType = "json"; 
 if (tp_res && tp_res.startsWith("b")) xhr.responseType = "blob"; 
 if (tp_res && tp_res.startsWith("t")) xhr.responseType = "text"; 

 var _fn_err = x => {alert(`REQUEST_ERROR\n\n${x.status}\n\n${x.response}`); console.log(x)};
 var _fn_suc = fn_suc || (x => console.log(x));

 var fn_aux_hdr = (xhr_a, hdrs_a) => {
   if (!hdrs_a) return;
   for (let i = 0; i < hdrs_a.length; i += 2){
     if (hdrs_a[i] == "a1") {xhr_a.setRequestHeader("Authorization", "Basic "  + hdrs_a[i+1]); continue;}
     if (hdrs_a[i] == "a2") {xhr_a.setRequestHeader("Authorization", "Bearer " + hdrs_a[i+1]); continue;}
     if (hdrs_a[i] == "ct") {xhr_a.setRequestHeader("Content-Type", hdrs_a[i+1].replace("a/j","application/json")); continue;}
     xhr_a.setRequestHeader(hdrs_a[i], hdrs_a[i+1]);
    }
  }

 var fn_aux_data = (args_a, opt) => {
  if (opt == 1) {
      let qs = [];
      for (let i = 1; i < args_a.length; i += 2) qs.push(encodeURIComponent(args_a[i]) + "=" + encodeURIComponent(args_a[i+1]).replaceAll("%20", "+"));
      return qs.join("&");
  }
  let fd = new FormData();
  for (let i = 1; i < args_a.length; i += 2) fd.append(args_a[i], args_a[i+1]);
  return fd;
 }

 var fn_aux_b2 = (xhr_a) => {
  var cont_disp = xhr_a.getResponseHeader("content-disposition"); //attachment; filename=test.csv
  if (!cont_disp) return "x"; 
  return cont_disp.split("=")[1].trim();
 }

 xhr.onreadystatechange = () => {
     if (xhr.readyState == 4){
     if (xhr.status != 200) return _fn_err(xhr);
     if (xhr.response == null) return _fn_err(xhr);
     if (tp_res && tp_res.endsWith("x")) return _fn_suc(xhr);
     if (tp_res == "b2") return _fn_suc([fn_aux_b2(xhr), xhr.response]);
     _fn_suc(xhr.response);
     }
 }

 if (!args){
  xhr.open("GET", url, true);
  fn_aux_hdr(xhr, hdrs);
  return xhr.send();
  };

 if (args[0] == 1){
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  fn_aux_hdr(xhr, hdrs);
  return xhr.send(fn_aux_data(args, 1));
 }

 if (args[0] == 11){
  xhr.open("POST", url, true);
  fn_aux_hdr(xhr, hdrs);
  return xhr.send(fn_aux_data(args, 11));
 }

 if (args[0] == 111){
  xhr.open("POST", url, true);
  fn_aux_hdr(xhr, hdrs);
  return xhr.send(args[1]);
 }

 xhr.open(args[0], url, true);
 fn_aux_hdr(xhr, hdrs);
 if (args.length == 1) return xhr.send();
 return xhr.send(args[1]);
}


function get_tkn(fn, pref, usr)
{
 var app_pref = pref || "gw";
 var app_usr = usr || "u4";
 var dt_now = new Date();
 var dt_exp = new Date(localStorage.getItem(app_pref + "_" + app_usr + "_dttm_exp"));
 dt_exp.setSeconds(dt_exp.getSeconds() - 10);
 if (dt_now < dt_exp) return fn(localStorage.getItem(app_pref + "_" + app_usr + "_acc_tkn"));

 var client_id = localStorage.getItem(app_pref + "_client_id");
 var client_secret = localStorage.getItem(app_pref + "_client_secret");
 var refresh_token = localStorage.getItem(app_pref + "_" + app_usr + "_ref_tkn");

 var args = [1,"client_id",client_id,"client_secret",client_secret,"refresh_token",refresh_token,"grant_type","refresh_token"];

 ajax_r("https://oauth2.googleapis.com/token", args, (a) => {
  console.log(a);
  var d_now = new Date();
  d_now.setSeconds(d_now.getSeconds() + a.expires_in);
  localStorage.setItem(app_pref + "_" + app_usr + "_acc_tkn", a.access_token); 
  localStorage.setItem(app_pref + "_" + app_usr + "_dttm_exp", d_now.toString());
  fn(a.access_token);
 }); 
}

function sleep(milliseconds)
{
 var start = new Date().getTime();
 for (var i = 0; i < 1e7; i++) if ((new Date().getTime() - start) > milliseconds) break;
}