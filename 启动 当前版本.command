#!/bin/zsh
set -euo pipefail
root_dir="${0:A:h}"
exec "$root_dir/启动工具/launch-site.zsh" "$root_dir" 4176 '当前版本'
