#!/bin/zsh
set -euo pipefail

if [[ "$#" -ne 3 ]]; then
  echo '用法：launch-site.zsh <网站目录> <端口> <版本名称>' >&2
  exit 64
fi

site_dir="$1"
port="$2"
display_name="$3"
url="http://127.0.0.1:${port}/"

if [[ ! -f "$site_dir/package.json" ]]; then
  echo "找不到 $display_name 的网页文件：$site_dir" >&2
  exit 66
fi

node_bin="$(command -v node || true)"
if [[ -z "$node_bin" && -d "$HOME/.nvm/versions/node" ]]; then
  node_bin="$(find "$HOME/.nvm/versions/node" -maxdepth 3 -type f -name node | sort | tail -n 1 || true)"
fi
if [[ -z "$node_bin" ]]; then
  echo '未找到 Node.js。请先安装 Node.js 22 或更高版本，然后再次双击此文件。' >&2
  exit 69
fi

vite_bin="$site_dir/node_modules/vite/bin/vite.js"
if [[ ! -f "$vite_bin" ]]; then
  echo "缺少 $display_name 的本地依赖。请勿移动或删除 $site_dir/node_modules。" >&2
  exit 69
fi

if curl -fsS --max-time 2 "$url" >/dev/null; then
  open "$url"
  exit 0
fi

runtime_dir="$site_dir/.local-preview"
mkdir -p "$runtime_dir"
log_file="$runtime_dir/vite.log"
pid_file="$runtime_dir/vite.pid"

echo "正在启动 $display_name…"
(cd "$site_dir" && nohup "$node_bin" "$vite_bin" --host 127.0.0.1 --port "$port" > "$log_file" 2>&1 & echo $! > "$pid_file")

for attempt in {1..45}; do
  if curl -fsS --max-time 2 "$url" >/dev/null; then
    echo "$display_name 已在浏览器打开：$url"
    open "$url"
    exit 0
  fi
  sleep 1
done

echo "$display_name 未能在 45 秒内启动。请查看日志：$log_file" >&2
exit 1
