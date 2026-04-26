function get_tkn(fn, pref, usr)
{
 var app_pref = pref || "gw";
 var app_usr = usr || "u4";
 var now_dt = new Date();
 var exp_dt = new Date(localStorage.getItem(app_pref + "_" + app_usr + "_dttm_exp"));
 exp_dt.setSeconds(exp_dt.getSeconds() - 10);
 if (now_dt < exp_dt) return fn(localStorage.getItem(app_pref + "_" + app_usr + "_acc_tkn"));

 var client_id = localStorage.getItem(app_pref + "_client_id");
 var client_secret = localStorage.getItem(app_pref + "_client_secret");
 var refresh_token = localStorage.getItem(app_pref + "_" + app_usr + "_ref_tkn");

 var args = [1,"client_id",client_id,"client_secret",client_secret,"refresh_token",refresh_token,"grant_type","refresh_token"];

 ajax_r("https://oauth2.googleapis.com/token", args, (a) => {
  console.log(a);
  var now_d = new Date();
  now_d.setSeconds(now_d.getSeconds() + a.expires_in);
  var end_d = new Date(now_d.setHours(now_d.getHours()-3)).toISOString().slice(0, 19).replace("T"," ");
  localStorage.setItem(app_pref + "_" + app_usr + "_acc_tkn", a.access_token); 
  localStorage.setItem(app_pref + "_" + app_usr + "_dttm_exp", end_d);
  fn(a.access_token);
 }); 
}

function edit_file(id, txt, fn)
{
 get_tkn(t => { 

 const blob_ta = new Blob([txt.replaceAll("\n","\r\n")], {type: "text/plain"});
 ajax_r(url_gd_file_upd(id), ["PATCH", blob_ta], a => fn(a), ["a2", t, "ct", blob_ta.type]);
 
 });
}

function read_file(id, fn)
{
 get_tkn(t => {

  ajax_r(url_gd_file_byte(id), 0, (data_b) => fn(data_b), ["a2", t], "b");

 });
}

function read_file_txt(id, fn)
{
 get_tkn(t => {

  ajax_r(url_gd_file_byte(id), 0, (data_b) => {

    const reader = new FileReader();
    reader.onload = (e) => fn(e.target.result);
    reader.readAsText(data_b);

  }, ["a2", t], "b");

 });
}

function new_file(par_id, file_nm, txt, fn)
{
 get_tkn(t => { 

 var metadata = {"name": file_nm, "mimeType": "text/plain", "parents": [par_id]};
 var arr = [11,"metadata",new Blob([JSON.stringify(metadata)], {type: "application/json"}), 
               "file", new Blob([txt.replaceAll("\n","\r\n")], {type: "text/plain"})];

 ajax_r(url_gd_file_new(), arr, (a) => fn(a), ["a2",t]);
 
 });
}

function list_all(id, fn)
{
 get_tkn(t => {

  ajax_r(url_gd_list_all(id), 0, (data) => fn(data), ["a2", t]);

 });
}

function list_files(id, fn)
{
 get_tkn(t => {

  ajax_r(url_gd_list_files(id), 0, (data) => fn(data), ["a2", t]);

 });
}

function info_file(id, fn)
{
 get_tkn(t => {

  ajax_r(url_gd_file_info(id), 0, (data) => fn(data), ["a2", t]);

 });
}

function rename_file(id, file_nm, fn)
{
 get_tkn(t => {

 ajax_r(url_gd_file_info(id), ["PATCH", JSON.stringify({"name": file_nm})], (data) => fn(data), ["a2", t, "ct", "a/j"]);
 
 });
}

function del_file(id, fn)
{
 get_tkn(t => {

 ajax_r(url_gd_file_info(id), ["PATCH", JSON.stringify({"trashed": true})], (data) => fn(data), ["a2", t, "ct", "a/j"]);
 
 });
}


function get_id(file_nm, dir_id)
{
 var dir_id_f = dir_id || "1imffNttBNpZGvDucmenegfE-RKwWSNLw";
 return JSON.parse(localStorage.getItem("cont_" + dir_id_f)).filter(ob => ob.name == file_nm)[0].id;
}

function url_gd_list_all(id)
{
 return `https://www.googleapis.com/drive/v3/files?q=%27${id}%27+in+parents+and+trashed%3Dfalse&fields=files(id,name,mimeType)&orderBy=name&pageSize=1000`
}

function  url_gd_list_files(id)
{
 return `https://www.googleapis.com/drive/v3/files?q=%27${id}%27+in+parents+and+trashed%3Dfalse+and+mimeType!%3D%27application/vnd.google-apps.folder%27&fields=files(id,name)&orderBy=name&pageSize=1000`
}

function url_gd_file_info(id)
{
 return `https://www.googleapis.com/drive/v3/files/${id}`;
}

function url_gd_file_byte(id)
{
 return `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
}

function url_gd_file_upd(id)
{
 return `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`;
}

function url_gd_file_new()
{
 return "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";
}

function url_gd_view_file(id)
{
 return `https://drive.google.com/file/d/${id}/view`;
}

function url_gd_view_folder(id)
{
 return `https://drive.google.com/drive/folders/${id}`;
}