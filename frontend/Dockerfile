FROM node:20-bookworm-slim

# Buat environment dulu untuk container
# ENV GROUP_NAME RubyCMS
ENV USER_NAME Gidion
ENV USER_HOME=/home/${USER_NAME}

# Note: RUN di eksekusi didalam container
# RUN groupadd ${GROUP_NAME} && \
# 	useradd --gid ${GROUP_NAME} --groups 0 --shell /bin/bash --home-dir ${USER_HOME} --create-home ${USER_NAME} && \
# 	passwd -d ${USER_NAME}

# copy repo berdasarkan base. kasus ini /home/itron/Gidion/git ke <target dir>
# Note: Copy di eksekusi didalam host
# RUN npm run build
RUN mkdir ${USER_HOME}
COPY build/ ${USER_HOME}/build
WORKDIR ${USER_HOME}
RUN npm install -g serve

# Note: Eksekusi entry point didalam container
CMD ["serve", "-s", "build"]
