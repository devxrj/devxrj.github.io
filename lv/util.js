var prefix_ls = "conteudo_";
var arg_l = get_p("l");
var key_ls = prefix_ls + arg_l;
var text_g = [];
var id_g = get_id(arg_l);

(() => {

  if (arg_l == "") return;

  if (id_g == -1){
     cache_file_list(); 
     return alert("Set Cache...");
  }
  
  elem_a_edit.href = `${get_page_url()}?l=${arg_l}&ed=1&orig=${btoa(location.href)}`;
  elem_dv_om.onclick = () => add_def_items(1);

  if (get_p("ed") == "1") { 
   elem_ed.style.display = "block"; 
   get_ed_text(); 
   return; 
  } 
  
  if (get_p("cl") == "1" && loc_get(key_ls)) loc_rem(key_ls);  
  
  elem_lnks.style.display = "block"; 
  get_links();

})();


function upd_file_lv()
{ 
  edit_file(id_g, elem_ta.value.trim() , (rd) => { loc_rem(key_ls); elem_stt.innerHTML = (new Date()).getMilliseconds();});
}

function get_ed_text()
{
  elem_lnk_voltar.href = (get_p("orig") == "") ? `${get_page_url()}?l=${arg_l}` : atob(get_p("orig"));
  elem_lnk_voltar_rw.href = `${get_page_url()}?l=${arg_l}`;
  elem_ta.style.height = is_mob()? "450px" : "500px" ;  
  read_file_txt(id_g,  (res)=> elem_ta.value = res);
}

function get_links()
{
  var ls_conteudo = loc_get(key_ls);
  
  if (ls_conteudo){
  console.log("--local--");
  get_links_aux(ls_conteudo);
  return
  }
  
  read_file_txt(id_g, (res)=>{
    console.log( "--server--" );
    loc_set(key_ls, res);
    get_links_aux(res);
   });
}


function get_links_aux(conteudo)
{
  var tb_show = true;
  var html = "";  
  if (get_p("rw") == "1") { 
    text_g = conteudo.replace(/\r\n/g,"\n");
    text_g = text_g.trim().split("\n");
    elem_lv.innerHTML = `<div style='margin-left:${is_mob()?"5%":"15%"}'>${text_g.map(esc_ent_raw).join("<br>")}<br></div>` ;
    return set_tb_btn(tb_show);
  }
  
  text_g = conteudo.replace(/\r\n/g, "\n");
  text_g = text_g.trim().replace(/\n(\s|\n)*\n/g, "\n").split("\n");
  
  var par_block = get_blocks(text_g,["(",")"]);
  var com_block_all = get_blocks(text_g,["/*","*/"]);
  var colc_block_all = get_blocks(text_g,["[","]"]);
  
  var com_block_n1 = com_block_all.filter((b) => check_n1(par_block,b));
  var colc_block_n1 = colc_block_all.filter((b) => check_n1(par_block,b));
  var vis_blocks_n1 = com_block_n1.concat(colc_block_n1, par_block);
  var def_block_n1 = get_def_blocks([0,text_g.length-1], vis_blocks_n1);
  var all_blocks_n1 = def_block_n1.concat(vis_blocks_n1).sort((a, b) => a[0]-b[0]);
  
  all_blocks_n1.forEach ((b) => {
  
    if (is_in_block (com_block_n1, b)) return;
    if (is_in_block (def_block_n1, b)) html += get_block_html(b, "v");
    if (is_in_block (colc_block_n1, b)) html += get_block_html(b, "h"); 
    if (is_in_block (par_block, b)){
    
     if ((b[1]-b[0]) < 3) return;
     if (lin_is_comm(b[0]+1))  return;
     var lbl_agrup = text_g[b[0]+1].trim();
     var show_expand = false;
     if (lbl_agrup.endsWith("...")) {
        lbl_agrup = lbl_agrup.substring(0, lbl_agrup.length - 3);
        show_expand = true;
     }
     html += `<div>
     <div onclick="toggle_agrup(this);" class="agrup" style="padding:3px;cursor:default;">&bull; ${lbl_agrup}</div>
     <div style='display:${show_expand ? "block" : "none"};padding-top:10px;padding-left:${(is_mob()) ? "4%" : "3%"}'>`;
    
     var colc_block_n2 = get_blocks_n2(colc_block_all,b);
     var com_block_n2 = get_blocks_n2(com_block_all,b);
     var vis_blocks_n2 = com_block_n2.concat(colc_block_n2);
     var def_block_n2 = get_def_blocks([b[0]+2,b[1]-1],vis_blocks_n2);
     var all_blocks_n2 = def_block_n2.concat(vis_blocks_n2).sort((x,y) => x[0]-y[0]);
     
     all_blocks_n2.forEach ((b_n2) => {
       if (is_in_block (com_block_n2, b)) return;
       if (is_in_block (def_block_n2,b_n2)) html += get_block_html(b_n2, "v"); 
       if (is_in_block (colc_block_n2,b_n2)) html += get_block_html(b_n2, "h"); 
     });
    
     html = html.slice(0, -4) + "</div></div><br>";
     return;
    
    }
  
  });
  
  elem_lv.style.paddingLeft = (is_mob()) ? "5%" : "15%";
  elem_lv.innerHTML = html;
  
  set_tb_btn (tb_show);
  
  if (get_p("ge") == "1") window.scrollTo(0,document.body.scrollHeight);
  
  set_data_conf();
  
  if (get_p("op") != "") window["op" + get_p("op")]();

}

function get_block_html(b, t)
{
  var arr_htm_lin=[];
  var html = "";
  
  if (t == "v"){  
    for (let i = b[0]; i <= b[1]; i++) {
    if (lin_is_comm(i)) continue;
    arr_htm_lin.push(get_html_lin(i));
    } 
    
    html += (arr_htm_lin.length != 0)? `<div style='word-wrap:break-word;'>
    <div onclick='dvclnk(this,event)'>${arr_htm_lin.join("</div><br><div onclick='dvclnk(this,event)'>")}</div></div><br>`:"";
    
    return html;
  }
  
  if (t == "h"){  
     if ( (b[1]-b[0]) == 1 ) return "";
     for (let i = b[0]+1; i < b[1]; i++){
     if (lin_is_comm(i)) continue;
     arr_htm_lin.push(get_html_lin(i));
     } 
    
     html += (arr_htm_lin.length != 0)? `<div style='word-wrap:break-word;line-height:175%;'>${arr_htm_lin.join("")}</div><br>`:"";
     
     return html;
  }
}

function toggle_agrup(elem)
{
  var next_elem = elem.nextElementSibling;
  next_elem.style.display = (next_elem.style.display == 'none') ? 'block' : 'none';
}

function lin_is_comm(ind)
{ 
  return text_g[ind].trim().startsWith("//"); 
}

function get_html_lin(ind)
{
  var lin_t = text_g[ind].trim();
  var sep_conf = lin_t.indexOf(": ");
  var conf_txt = (sep_conf == -1) ? "" : lin_t.substring(0,sep_conf);
  var conf_lnk = (sep_conf == -1) ? lin_t : lin_t.substring(sep_conf+2);
  var attrib_conf_txt = (sep_conf == -1) ? "" : ` data-conf="${conf_txt}" `;
  
  var conf = get_config(conf_lnk);
  var tipo = conf[0];
  var descr = conf[1];
  var lnk = conf[2];
  
  if (tipo == 1){
  if (descr == "______") return `<span id="s${ind}" onclick="stl_td(this)" style="width:100%;border-bottom:1px solid gray;font-size:6px;display:inline-block;">&nbsp;</span>`;
  var descr_f = descr.startsWith("<") ? descr : descr.replace(/ /g, "&nbsp;&nbsp;");
  return `<span id="s${ind}" onclick="stl_td(this)" style="margin-right:15px;">${descr_f}</span>`; 
  }
  
  return `<img id="i${ind}" onclick="stl_td(this)" src="${get_ico_lnk(lnk)}" width="16" height="16" style="vertical-align:middle;margin-right:6px;" onerror="this.src='${get_ico_lnk(0)}'">
  <a ${attrib_conf_txt} id="a${ind}" href="${lnk}" target="_blank" style="margin-right:15px;">${descr}</a>`;
}

function set_data_conf()
{
  Array.from(elem_lv.querySelectorAll('[data-conf]')).forEach ((elem,i) => {
  
  var dc = elem.getAttribute("data-conf").toLowerCase();
  
  if (dc.includes("x")) elem.previousElementSibling.src = "x.png";
  
  if (dc.includes("f")) {
  elem.onclick = (event) => {
  event.preventDefault();
  show_frame(elem);
  }
  elem.innerHTML = `<span style="font-style:italic;">${elem.innerHTML}</span>`;
  }
  
  if (dc.includes("i")) elem.click();
  
  });
}


function stl_td(elem)
{
  if (elem.tagName == "SPAN") {
  elem.style.backgroundColor  = (elem.style.backgroundColor == "") ? "yellow" : "";
  return;
  }
  elem.nextElementSibling.style.backgroundColor = (elem.nextElementSibling.style.backgroundColor == "") ? "yellow" : "";
}

function dvclnk(elem, evt)
{
  if (!is_mob()) return;
  var ls = elem.getElementsByTagName("a");
  if (ls.length == 0) return;
  if (evt.target.tagName == "DIV") ls[0].click();
}


function set_tb_btn(tb_show)
{
  if ( (document.body.scrollHeight > 3*window.innerHeight) && tb_show ) {
  var v_left = "90%";
  var v_top1 = "50px";
  var v_top2 = (window.innerHeight - 100) + "px";
  var ih = `<span onclick="window.scrollTo(0,0);" style="position:fixed;left:${v_left};top:${v_top2};" onmouseover="this.style.cursor='pointer'">
  <img src="t.png" width="32" height="32">
  </span>
  <span onclick="window.scrollTo(0,document.body.scrollHeight);" style="position:fixed;left:${v_left};top:${v_top1};" onmouseover="this.style.cursor='pointer'">
  <img src="b.png" width="32" height="32">
  </span>`;
  elem_tb.innerHTML = ih ;
  }
}

function show_frame(elem)
{
  elem_ifc.style.display = "block";
  var pg_if = elem_ifc.children[1];
  pg_if.src = elem.href;
  pg_if.style.height = window.innerHeight + "px";
}

function check_n1(par_block, b)
{
  for (let i = 0; i < par_block.length; i++){
  if ((b[0] > par_block[i][0]) && (b[1] < par_block[i][1])) return false;
  }
  return true;  
}

function get_blocks_n2(lst_blocks, b)
{
  var m_blocks = [];
  for (let i = 0; i < lst_blocks.length; i++){
  if ((b[0] < lst_blocks[i][0]) && (b[1] > lst_blocks[i][1])) m_blocks.push(lst_blocks[i]);
  }
  return m_blocks;  
}

function get_blocks(arr,tokens,interv)
{
  var a_aux = [];
  var m_blocks = [];
  var _interv = (interv == undefined) ? [0,arr.length-1] : interv;
  
  for (let i = _interv[0]; i <= _interv[1]; i++) { 
  if (arr[i].trim() == tokens[0]) {
  a_aux.push(i);
  continue;
  }
  if (arr[i].trim() == tokens[1]) {
  a_aux.push(i);
  m_blocks.push([...a_aux]);
  a_aux.length = 0;
  }
  }  
  return m_blocks;
}

function get_def_blocks(interv, vis_blocks) 
{
 var arr_aux = [];
 var arr_aux2 = [];
 var def_block = [];

 if (vis_blocks.length == 0) return [interv];
 
 for (let i = interv[0]; i <= interv[1]; i++) { 
  if (lin_is_in_block(vis_blocks,i)) {
      arr_aux.push("");
      continue;
  }
  arr_aux.push(i); 
 }
 
 arr_aux2 = arr_aux.join().split(new RegExp(',{2,}', 'g'));
 
 for (let i = 0; i < arr_aux2.length; i++){  
  if (arr_aux2[i] == "") continue;
  let a_tmp = arr_aux2[i].split(",");
  def_block.push([parseInt(a_tmp[0]), parseInt(a_tmp[a_tmp.length-1])]);
 }
 
 return def_block;
}


function is_in_block(blocks, b) 
{
 for (let i = 0; i < blocks.length; i++) {
   if (blocks[i][0] == b[0] && blocks[i][1] == b[1]) return true;
 }
 return false;
}

function lin_is_in_block(blocks, ind)
{
 for (let i = 0; i < blocks.length; i++) { 
   if ((ind >= blocks[i][0]) && (ind <= blocks[i][1])) return true;
 }
 return false;
}


function get_page_url()
{
 return location.origin + location.pathname;
}

function esc_ent(str)
{
 return str;
 //return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function esc_ent_raw(str)
{
 return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function get_sel_ind(tag_name)
{
 var elem_sel = [];
 var arr_elem = Array.from(elem_lv.getElementsByTagName(tag_name));
 var arr_elem2 = arr_elem.filter(o => o.style.backgroundColor == "yellow");
 arr_elem2.forEach(o => elem_sel.push(parseInt(o.id.match(/\d+/))));
 return elem_sel;
}

function remove_item(all_sel_ind)
{
  var text_m = [...text]; 
 
  all_sel_ind.sort((a,b) => b-a).forEach ((o) => text_m.splice(o, 1));

  var index_empty1 = [];
  var arr_tkns_ini = ["["];
  var arr_tkns_end = ["]"];
  text_m.forEach ((o, i) => {
  if (arr_tkns_ini.includes(o.trim()) && arr_tkns_end.includes(text_m[i+1].trim())) index_empty1.push(i, i+1); 
  if (arr_tkns_ini.includes(o.trim()) && arr_tkns_end.includes(text_m[i+2].trim())) index_empty1.push(i, i+2);
  });
  index_empty1.sort((a,b) => b-a).forEach ((o) => text_m.splice(o, 1));

  var index_empty2 = [];
  text_m.forEach ((o, i) => {
  if (o.trim() == "(" && text_m[i+2].trim() == ")") index_empty2.push(i, i+1, i+2); 
  });
  index_empty2.sort((a,b) => b-a).forEach ((o) => text_m.splice(o, 1));

  edit_file(id_g, text_m.join("\n\n") , (rd) => {loc_rem(key_ls);  elem_msg_ri_s.innerHTML = all_sel_ind.length + " Item(s) Rem.";   });
}

function add_item_ai()
{
  var txt0 = elem_msg_ai_i0.value.trim();
  var txt1 = elem_msg_ai_i1.value.trim();
  var txt2 = elem_msg_ai_i2.value.trim();
  
  if (txt0 == "" && txt1 == "") {alert("Empty!"); return;}
  var txt_append = (txt0 == "") ? txt1 : txt0.replace(/,/g, '&#44;') + "," + txt1;

  text_g.push(txt_append);
   
  edit_file(id_g, text_g.join("\n\n") , (rd) => {loc_rem(key_ls);  elem_msg_ai_s.innerHTML=(new Date()).getMilliseconds(); });
}

function util_m(elem) 
{
 if (elem.id == "it_opc3"){
  if (confirm("Clear Cache?")) loc_rem(key_ls); 
 }

 if (elem.id == "it_opc4"){
  if (confirm("Clear Cache All?")) {
   loc_keys().forEach((key)=>{
   if (key.startsWith(prefix_ls)) loc_rem(key);
   });
 }
}

 if (elem.id == "it_opc5"){   
  if (is_mob()) elem_msg_ai.children[0].style.width = "85%";
  elem_msg_ai_d.onclick = () => { elem_msg_ai_a.href=get_page_url() + "?l=" + arg_l + "&ge=1"; }
  elem_msg_ai.style.display = "block"; 
}

 if (elem.id == "it_opc6"){
 var arr_all_links = Array.from(elem_lv.getElementsByTagName("a"));
 var sel_ind_span = get_sel_ind("span");
 var sel_ind_a = get_sel_ind("a");
 var all_sel_ind = [...sel_ind_span,...sel_ind_a];
 var qtd_sel_rem = all_sel_ind.length;

 elem_msg_ri_spn_descr.innerHTML = "Selecionados: "  + qtd_sel_rem + "<br>Total de Links: " + arr_all_links.length;
 elem_msg_ri_btn.disabled = (qtd_sel_rem == 0) ? true : false;

 elem_msg_ri_btn.onclick = () => {remove_item(all_sel_ind);};
 elem_msg_ri_d.onclick = () => {elem_msg_ri_a.href=get_page_url() + '?l=' + arg_l;}

 elem_msg_ri.style.display = "block";
}

elem_msg.style.display = "none";

}

function add_def_items(opc)
{
 elem_menu_opts.innerHTML = "";
 add_opts_it("it_opc3", "Clear Cache", util_m);
 add_opts_it("it_opc4", "Clear Cache (All)", util_m);
 add_opts_it("it_opc5", "Add Item", util_m);
 add_opts_it("it_opc6", "Remove Item", util_m);
 if (opc == 1) elem_msg.style.display = "block";
}

function get_ymd()
{
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  return "" + y + (m<=9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
}

function get_par(v)
{ 
 return "s=" + v.trim();
}

function fav_imp_html()
{
 var str="<dl>\n";
 str+=`<dt><h3>${get_ymd()}</h3></dt>\n<dl>`;
 Array.from(elem_lv.getElementsByTagName("a")).forEach(o => str+="\n<dt>" + o.outerHTML + "</dt>");
 str+="\n</dl>\n</dl>";
 console.log (str);
}


function loc_get(k)
{
 return localStorage.getItem(k);
}

function loc_set(k,v)
{
 localStorage.setItem(k,v);
}

function loc_rem(k)
{
 localStorage.removeItem(k);
}

function loc_keys()
{
 return Object.keys(localStorage);
}

function get_title_ai()
{
  var txt1 = elem_msg_ai_i1.value.trim();
  if (!txt1.startsWith("#")) return;
  var url_api = "";
  
  if (txt1.startsWith("#y")) 
    url_api = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + txt1.substring(2).trim() + "&key=AIzaSyC4oGvGvMehPLyCwPoWMng-4NYD-2oLGbA";  
  
  ajax_r(url_api, 0, (a)=> elem_msg_ai_i0.value = a.items[0].snippet.title);
}

function filter_url_ai()
{
  var txt1 = elem_msg_ai_i1.value.trim();
  var v_url = get_url(txt1);
  if (!v_url) return;

  if (v_url.hostname.includes("youtu.be")) elem_msg_ai_i1.value = "#y " + v_url.pathname.substring(1);
  if (v_url.hostname.includes("youtube.com")) elem_msg_ai_i1.value = "#y " + get_p("v", v_url);
}

function copy_ai()
{
 navigator.clipboard.writeText(elem_msg_ai_i0.value + ", " + elem_msg_ai_i1.value)
                   .then(() => {alert("successfully copied");}).catch(() => {alert("something went wrong");});
}

function add_opts_it(id, name, fn_click)
{
 var new_it = document.createElement("div");
 if (id != "") new_it.id = id;
 new_it.onclick = () => {fn_click(new_it, event);};
 new_it.innerHTML = "<span style='cursor:default;'>" + name + "</span>";
 new_it.style.cssText = "padding:5px;word-wrap:break-word;";
 elem_menu_opts.appendChild(new_it);
 if (new_it.previousElementSibling) new_it.previousElementSibling.style.borderBottom = "1px solid";
}

function randomIntFromInterval(min, max)
{ 
 return Math.floor(Math.random() * (max - min + 1) + min);
}

function op1()
{
var rhtml = "";
Array.from(elem_lv.getElementsByTagName("a")).forEach((o) => { 

var frame_b = false ;
if (o.getAttribute("data-conf") && o.getAttribute("data-conf").toLowerCase().includes("f")) frame_b = true;
var num_ind = o.id.substring(1) ;
var link = o.href ;
var img_src = o.previousElementSibling.src ;
var descr = (o.innerText.length <=13) ? o.innerText : o.innerText.substring(0,13) + "..." ;
var iqtd = (localStorage.getItem("conf_qtd") == null || localStorage.getItem("conf_qtd") == "") ? 5 : parseInt(localStorage.getItem("conf_qtd"));
var wdth  = Math.floor(100/iqtd - 2);

rhtml += `<div style="display:inline-block;text-align:center;margin:1%;width:${wdth}%;vertical-align:text-top;word-wrap:break-word;">`;

rhtml += (frame_b)? 
        `<a id="a${num_ind}" href="${link}" target="_blank" style="text-decoration:none;color:black;" onclick="event.preventDefault();show_frame(this)" >`:
        `<a href="${link}" target="_blank" style="text-decoration:none;color:black;">`;

rhtml += `<img src="${img_src}" width="32" height="32" style="border-radius:50%;" onerror="this.src='${get_ico_lnk(0)}'"><br>`;

rhtml += (frame_b)? 
         `<span style="color:#5F6368;font-family:arial,sans-serif;font-size:13px;font-style:italic;">${descr}</span>`:
         `<span style="color:#5F6368;font-family:arial,sans-serif;font-size:13px;">${descr}</span>`;

rhtml += '</a></div>';

});

elem_dv_om.onclick = () => {
 add_def_items();
 add_opts_it("", "Set Size", () => {
   elem_set_sz.style.display = "block";
   elem_msg.style.display = "none";
   });
 elem_msg.style.display = "block";
}

elem_lv.style.paddingLeft = "";
elem_lv.innerHTML = rhtml;
}

function op2()
{
 elem_lv.style.display = "none";
 elem_dv_om.onclick = () => {
 add_def_items();
 add_opts_it("", "Show/Hide", () => {
   elem_lv.style.display = (elem_lv.style.display == "none") ? "block" : "none";
   elem_msg.style.display = "none";
   });
 elem_msg.style.display = "block";
 }
}

function op3()
{
Array.from(elem_lv.getElementsByClassName("agrup")).forEach((ob) => {
 const spn_m = document.createElement("span");
 spn_m.innerHTML = "&#x21bb;";
 spn_m.style.marginLeft = "10px";
 spn_m.addEventListener("click", (event) => {
  event.stopPropagation();
  var lnks = Array.from(ob.nextElementSibling.querySelectorAll("a, span"));
  var rnd_ind = randomIntFromInterval(0, lnks.length -1);
  var lnk_html = (lnks[rnd_ind].tagName == "SPAN") ? lnks[rnd_ind].outerHTML : (lnks[rnd_ind].previousElementSibling.outerHTML + lnks[rnd_ind].outerHTML);
  lnk_html = lnk_html.replace(/id="([^"]*)"|onclick="([^"]*)"/gi, "");
  elem_menu_opts.innerHTML = "";
  add_opts_it("", lnk_html, dvclnk);
  elem_msg.style.display = "block";
 });
 ob.appendChild(spn_m);

 });
}

