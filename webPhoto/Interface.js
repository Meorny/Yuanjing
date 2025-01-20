export class Interface {

    constructor() {
        // 创建一个消息对象，将在JSON序列化后发送到服务器
        this.message = {};

        // 包含所有监听器函数的引用对象（用于以后移除）
        this.listeners = {};

        // 硬编码WebSocket URL
        //this.webSocketUrl = "ws://localhost:9980";
		this.webSocketUrl = "ws://28.0.0.1:7210";

        // 页面加载时自动连接
        this.onConnect();

		// 输出
		// 自动发送
		this.onSendPoint();
    }

    onConnect() {
        // 尝试通过WebSocket连接到TouchDesigner
        this.socket = new WebSocket(this.webSocketUrl);

        // 在WebSocket上添加监听器
        this.addSocketListeners();
    }

    onOpen(e) {
        console.info(`与TouchDesigner的连接已建立 (${e.target.url})`);

        // 添加交互元素的监听器
        this.addInteractionListeners();

        // 显示交互元素
        document.querySelector("#touch-zone").style.display = "block";
        document.querySelector("#button-zone").style.display = "block";
        document.querySelector("#text-zone").style.display = "block";
    }

    onClose() {
        // 移除监听器
        this.removeSocketListeners();
        this.removeInteractionListeners();

        // 隐藏交互元素
        document.querySelector("#touch-zone").style.display = "none";
        document.querySelector("#button-zone").style.display = "none";

        alert("与服务器的连接已关闭。");
    }

    onError() {
        // 移除监听器
        this.removeSocketListeners();
        this.removeInteractionListeners();

        // 隐藏通信元素
        document.querySelector("#touch-zone").style.display = "none";
        document.querySelector("#button-zone").style.display = "none";
        alert("由于发生错误，无法建立与TouchDesigner的连接。");
    }

    onSendText() {
        // 获取输入的文本内容
        this.message.text = document.getElementById("text").value;

        // 发送JSON消息
        this.socket.send(JSON.stringify(this.message));
    }

	// 发送点
	onSendPoint() {
        // 结束输出 endStroke
        // 随时输出 afterUpdateStroke
        document.addEventListener('endStroke', (event) => {
            // 导出图片数据URL
            const imageUrl = signaturePad.toDataURL("image/png");
            // 检查imageUrl是否为空
            if (imageUrl) {
                console.log(imageUrl);
            } else {
                console.error("Failed to generate data URL.");
            }
            this.message.imageUrl = imageUrl;
            this.socket.send(JSON.stringify(this.message));
        });
        // 发送点信息 可选用
        const userAgent = navigator.userAgent;
		const deviceType = userAgent.match(/iPad|iPhone|Android/) ? '移动设备' : 'PC端';
		if (deviceType === '移动设备') {
			document.getElementById("touch-zone").addEventListener('touchmove', (e) => {
				const rect = e.target.getBoundingClientRect();
				const pos = {
					x: (e.touches[0].clientX - rect.left) * (e.target.width / rect.width),
					y: (e.touches[0].clientY - rect.top) * (e.target.height / rect.height)
				};
	
				this.message.xP = pos.x / e.target.width;
				this.message.yP = 1 - (pos.y / e.target.height);  // 修改为正值
	
				this.socket.send(JSON.stringify(this.message));
			});
		} else {
			document.addEventListener('afterUpdateStroke', (event) => {
				const { x, y, pressure } = event.detail;
				this.message.xP = x / canvas.width;
				this.message.yP = 1 -(y / canvas.height);  // 修改为正值
				this.message.pressure = pressure;
				this.socket.send(JSON.stringify(this.message));
			});
		}
	}
	

    onMessage(e) {
        const message = JSON.parse(e.data);
        console.log(message);
    }

    /**
     * 处理移动事件。
     * 此函数用于在鼠标移动或触摸移动时，计算并传输相对于目标元素的位置信息。
     * @param {Event} e - 触发的事件对象，可以是鼠标移动或触摸移动事件。
     */
    onMove(e) {
        // 获取目标元素的边界信息。
        const rect = e.target.getBoundingClientRect();
        // 初始化位置对象。
        const pos = {
            x: 0,
            y: 0
        };

        // 根据事件类型计算位置。
        // 适应不同类型的移动（点击 vs. 触摸）
        if (e.type === "mousemove") {
            // 鼠标移动事件中，计算鼠标位置相对于元素的位置。
            pos.x = (e.clientX - rect.left) * (e.target.width / rect.width);
            pos.y = (e.clientY - rect.top) * (e.target.height / rect.height);
        } else if (e.type === "touchmove") {
            // 触摸移动事件中，计算触摸点位置相对于元素的位置。
            pos.x = (e.touches[0].clientX - rect.left) * (e.target.width / rect.width);
            pos.y = (e.touches[0].clientY - rect.top) * (e.target.height / rect.height);
        }

        // 限制位置在元素范围内。
        pos.x = Math.min(e.target.width, Math.max(0, pos.x));
        pos.y = Math.min(e.target.height, Math.max(0, pos.y));

        // 调整位置信息，为TouchDesigner准备，包括翻转轴。
        this.message.x = pos.x / e.target.width;
        this.message.y = -pos.y / e.target.height;

        // 将位置信息转换为JSON字符串并通过WebSocket发送。
        this.socket.send(JSON.stringify(this.message));
    }

    /**
     * 处理点击事件的函数。
     * 当元素被点击时，此函数收集带有特定数据属性的元素信息，并根据点击类型（按下或释放）更新一个消息对象，
     * 最后将这个消息对象发送到通过WebSocket连接的服务器。
     * 
     * @param {Event} e - 事件对象，包含有关点击事件的信息。
     */
    onClick(e) {
        // 初始化一个数组，用于存储匹配到的元素名称。
        let matches = [];
        // 尝试获取事件路径，兼容不同的浏览器实现。
        let path = e.path || (e.composedPath && e.composedPath());

        // 如果路径信息可用，则遍历路径中的每个元素。
        if (path) {
            path.forEach(el => {
                // 检查元素是否具有"data-webwelder"属性。
                if (el.hasAttribute && el.hasAttribute("data-webwelder")) {
                    // 优先使用元素的"data-webwelder"值作为名称，若不存在则依次使用id、类名的第一个字符或元素的本地名称。
                    const name = el.dataset.webwelder || el.id || el.classList[0] || el.localName;
                    // 将匹配到的元素名称添加到数组中。
                    matches.push(name);
                }
            });
        }

        // 遍历匹配到的元素名称数组，根据事件类型（按下或释放）更新消息对象。
        matches.forEach(match => {
            if (e.type === "mousedown" || e.type === "touchstart") {
                // 如果是按下事件，则将对应元素名称的消息值设置为1。
                this.message[match] = 1;
            } else if (e.type === "mouseup" || e.type === "touchend") {
                // 如果是释放事件，则将对应元素名称的消息值设置为0。
                this.message[match] = 0;
            }
        });

        // 将更新后的消息对象转换为JSON字符串，并通过WebSocket发送。
        this.socket.send(JSON.stringify(this.message));
    }

    addSocketListeners() {
        this.listeners.onOpen = this.onOpen.bind(this);
        this.socket.addEventListener("open", this.listeners.onOpen);
        this.listeners.onClose = this.onClose.bind(this);
        this.socket.addEventListener("close", this.listeners.onClose);
        this.listeners.onError = this.onError.bind(this);
        this.socket.addEventListener("error", this.listeners.onError);
        this.listeners.onMessage = this.onMessage.bind(this);
        this.socket.addEventListener("message", this.listeners.onMessage);
    }

    removeSocketListeners() {
        this.socket.removeEventListener("open", this.listeners.onOpen);
        this.socket.removeEventListener("close", this.listeners.onClose);
        this.socket.removeEventListener("error", this.listeners.onError);
        this.socket.removeEventListener("message", this.listeners.onMessage);
    }

    addInteractionListeners() {
        // 为移动分配监听器
        this.listeners.onMove = this.onMove.bind(this);
        document.getElementById("touch-zone").addEventListener("touchmove", this.listeners.onMove);
        document.getElementById("touch-zone").addEventListener("mousemove", this.listeners.onMove);

        // 为点击和触摸分配监听器
        this.listeners.onClick = this.onClick.bind(this);
        document.body.addEventListener("mousedown", this.listeners.onClick, true);
        document.body.addEventListener("mouseup", this.listeners.onClick, true);
        document.body.addEventListener("touchstart", this.listeners.onClick, true);
        document.body.addEventListener("touchend", this.listeners.onClick, true);

        // 给“发送文本”按钮分配点击监听器
        this.listeners.onSendText = this.onSendText.bind(this);
        this.sendTextbutton = document.querySelector("#text-zone > button");
        this.sendTextbutton.addEventListener("click", this.listeners.onSendText);
    }

    removeInteractionListeners() {
        // 移除移动监听器
        document.getElementById("touch-zone").removeEventListener("touchmove", this.listeners.onMove);
        document.getElementById("touch-zone").removeEventListener("mousemove", this.listeners.onMove);

        // 移除点击和触摸监听器
        document.body.removeEventListener("mousedown", this.listeners.onClick, true);
        document.body.removeEventListener("mouseup", this.listeners.onClick, true);
        document.body.removeEventListener("touchstart", this.listeners.onClick, true);
        document.body.removeEventListener("touchend", this.listeners.onClick, true);

        // 移除“发送文本”按钮的点击监听器
        this.sendTextbutton = document.querySelector("#text-zone > button");
        this.sendTextbutton.removeEventListener("click", this.listeners.onSendText);

    }
}