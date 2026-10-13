/* 기록 옮기기 — 아이폰 홈 화면 아이콘마다 저장 공간이 따로라서,
   각 앱 아이콘에 쌓인 기록을 파일로 내보내 대시보드에서 가져오게 한다.
   대시보드 안(dashContainer 표시가 있는 저장 공간)에서는 버튼을 숨긴다. */
(function () {
  var SKIP = { "__storage_test": 1, "dashContainer": 1 };

  function standalone() {
    return navigator.standalone === true ||
      (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
  }
  function inDashboard() {
    try { return localStorage.getItem("dashContainer") === "1"; } catch (e) { return false; }
  }
  if (!standalone() || inDashboard()) return;
  if (location.pathname.indexOf("/my-dashboard/") === 0) return;

  function appName() {
    var p = location.pathname.split("/").filter(Boolean);
    return p[0] || "app";
  }
  function collect() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!SKIP[k]) data[k] = localStorage.getItem(k);
    }
    return data;
  }

  function exportNow() {
    var data;
    try { data = collect(); } catch (e) { alert("기록을 읽지 못했어요."); return; }
    if (!Object.keys(data).length) { alert("이 아이콘에는 옮길 기록이 없어요."); return; }
    var d = new Date();
    var ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    var json = JSON.stringify({ v: 1, app: appName(), at: d.toISOString(), data: data });
    var name = "기록-" + appName() + "-" + ymd + ".json";
    var file;
    try { file = new File([json], name, { type: "application/json" }); } catch (e) {}

    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).then(function () {
        alert("저장했어요.\n이제 대시보드 맨 아래 '기록 가져오기'에서 이 파일을 고르세요.");
      }).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(function () {
        alert("기록을 복사했어요.\n대시보드 맨 아래 '기록 가져오기' 칸에 붙여넣으세요.");
      }, function () { alert("복사에 실패했어요."); });
      return;
    }
    alert("이 기기에서는 내보내기가 안 돼요.");
  }

  function addButton() {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = "📦 기록 옮기기";
    b.setAttribute("style", [
      "position:fixed", "left:10px", "bottom:calc(10px + env(safe-area-inset-bottom))",
      "z-index:2147483647", "padding:7px 12px", "border-radius:999px",
      "border:1px solid rgba(0,0,0,.15)", "background:#fff8e6", "color:#333",
      "font:600 13px -apple-system,sans-serif", "box-shadow:0 2px 8px rgba(0,0,0,.15)"
    ].join(";"));
    b.onclick = function () {
      if (confirm("이 아이콘에 있는 기록을 파일로 내보낼까요?\n(대시보드로 옮기는 용도예요)")) exportNow();
    };
    document.body.appendChild(b);
  }
  if (document.body) addButton(); else document.addEventListener("DOMContentLoaded", addButton);
})();
