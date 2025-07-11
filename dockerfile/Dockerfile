# npm run build
# docker build -f dockerfile/Dockerfile -t oddworldjeffchan/yun-cloud-disk-web:1.0.0 .
# docker run -d --name yun-cloud-disk-web -p 80:80 oddworldjeffchan/yun-cloud-disk-web:1.0.0

# 生产阶段
FROM nginx

# 设置时区
ENV TZ=Asia/Shanghai

# 复制构建产物
COPY  dist /home/web

# 复制nginx配置
COPY ./dockerfile/nginx.conf /etc/nginx

# 创建nginx用户目录
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
