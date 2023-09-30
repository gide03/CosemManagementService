FROM python:3.11.5-slim-bookworm

# Buat environment dulu
ENV GROUP_NAME RubyCMS
ENV USER_NAME Gidion
ENV USER_HOME=/home/${USER}

# Note: RUN di eksekusi didalam container
RUN groupadd ${GROUP_NAME} && \
	useradd --gid ${GROUP_NAME} --groups 0 --shell /bin/bash --home-dir ${USER_HOME} --create-home ${USER_NAME} && \
	passwd -d ${USER_NAME}

RUN mkdir -p /home/app

# copy repo berdasarkan base. kasus ini /home/itron/Gidion/git ke <target dir>
# Note: Copy di eksekusi didalam host
COPY . /home/app
RUN cd /home/app
RUN pip install -r requirements

# Note: Eksekusi entry point didalam container
CMD ["flask", "run"]
