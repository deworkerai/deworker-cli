# Deworker CLI

Welcome to use deworker cli. This is a cli for deworker protocol powered by questflow labs.

## Installation

**Prerequisites**

Before you install deworker cli, you need to have node.js(>= v18.x) installed on your machine. You can download it from [node.js](https://nodejs.org/).

Because we use typescript as the development language, you need to have tsx installed on your machine. You can install it by running:
```bash
# pnpm
pnpm install -g tsx

# npm
npm install -g tsx

# yarn
yarn global add tsx
```

After you have installed all the prerequisites, you can install deworker cli by running:


```bash
# pnpm
pnpm install -g @questflow/deworker-cli

# npm
npm install -g @questflow/deworker-cli

# yarn
yarn global add @questflow/deworker-cli
```

## Setup

To setup deworker cli, you need to run the following command:

**Setup API key**

Now, you can not get API key. Please contact us contac@questflow.ai to get one.

```bash
deworker config set key your_api_key
```

## Start a worker

Before you start a worker, you need to download a worker from the [deworker repositories](https://github.com/deworkerai/deworker-worker).

**Example**

We can clone the hello worker from the deworker repositories by running:

```bash
git clone git@github.com:deworkerai/deworker-worker.git hello-worker
```

**Install the dependencies by running:**

Go to the worker directory and install the dependencies by running:

```bash
cd hello-worker
pnpm install
```

**Register peer**

Every worker needs to register a peer before it can start working. You can register a peer by running:

```bash
# generate a peer key pair
deworker peer generate --file
```

If it works, you will see the following output:

```bash
generating a peer key...
peer key generated successfuly!
saved peer key into /home/carney/work/questflow/github/hello-worker/peerKey.json successfuly!
```

And the peerKey.json content like this:
  
```json
{
  "id": "12D3KooWRLirPVvV5JRHG9YGX7LYcH726WGkBBCUcBvfKGWUZ237",
  "privKey": "CAESQDIwoCcqRVweMwZnHal1W1Hj3XLMrHUHNqv4WrZSLDSJ5qYddzhIGiY23T4kuR5RLxoU6v0aRu6XGwlN6don+S4=",
  "pubKey": "CAESIOamHXc4SBomNt0+JLkeUS8aFOr9GkbulxsJTenaJ/ku"
}
```

Copy the id, we will use it later.

Now you can register your peer bind to this worker by running:

```bash
deworker peer register --workerId=worker_id --peerId=your_peer_id
```

`workerId` is the worker id you will start get from the `deworker.yaml`. For the hello worker, the worker id is `worker-01`

`peerId` is the peer id you have registered. Here is `12D3KooWRLirPVvV5JRHG9YGX7LYcH726WGkBBCUcBvfKGWUZ237`

So, the final command is:

```bash
deworker peer register --workerId=worker-01 --peerId=12D3KooWRLirPVvV5JRHG9YGX7LYcH726WGkBBCUcBvfKGWUZ237
```

If it works, you will see the following output:

```bash
registering peer...
the peer has been successfully registered!
peer id: 12D3KooWRLirPVvV5JRHG9YGX7LYcH726WGkBBCUcBvfKGWUZ237
worker id: worker-01
```

**Start the worker**

After you have registered the peer, you can start the worker by running:

```bash
deworker peer start
```

If it works, you will see the following output:

```bash
checking whether the entry file exist...
choosing a best one relay node address...
the best one relay node address is /dns4/relay-staging.deworker.ai/tcp/8443/ws/p2p/12D3KooWA7xupjkFvhh7FgvASrTPXGzRsrN4yUWoKYw7nmZaQRJM
peer started with id 12D3KooWJrHnbc6wq5fKXJZxebXgdN7xZ6qaUK2io5ZikEqt33gx
connected to the relay /dns4/relay-staging.deworker.ai/tcp/8443/ws/p2p/12D3KooWA7xupjkFvhh7FgvASrTPXGzRsrN4yUWoKYw7nmZaQRJM
advertising with a relay address of /ip4/127.0.0.1/tcp/8443/ws/p2p/12D3KooWA7xupjkFvhh7FgvASrTPXGzRsrN4yUWoKYw7nmZaQRJM/p2p-circuit/p2p/12D3KooWJrHnbc6wq5fKXJZxebXgdN7xZ6qaUK2io5ZikEqt33gx
```

Congratulations! You have started a worker successfully!