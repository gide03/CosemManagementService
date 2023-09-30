FROM python:3.11.5-slim-bookworm

# Buat environment dulu
ENV GROUP_NAME RubyCMS
ENV USER_NAME Gidion
ENV USER_HOME=/home/${USER_NAME}

# Note: RUN di eksekusi didalam container
RUN groupadd ${GROUP_NAME} && \
	useradd --gid ${GROUP_NAME} --groups 0 --shell /bin/bash --home-dir ${USER_HOME} --create-home ${USER_NAME} && \
	passwd -d ${USER_NAME}

# copy repo berdasarkan base. kasus ini /home/itron/Gidion/git ke <target dir>
# Note: Copy di eksekusi didalam host
COPY . ${USER_HOME}
RUN pip install -r ${USER_HOME}/requirements.txt
WORKDIR ${USER_HOME}

# Note: Eksekusi entry point didalam container
CMD ["flask", "run", "--host", "0.0.0.0"]
