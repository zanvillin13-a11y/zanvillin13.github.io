// Script para la interactividad de la página.
// Se ejecuta cuando el DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
        });
    }

    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector('.menu-trigger');

        if (!trigger) return;

        trigger.addEventListener('click', (event) => {
            event.stopPropagation();

            const isOpen = dropdown.classList.contains('open');

            dropdowns.forEach((item) => {
                item.classList.remove('open');
                const btn = item.querySelector('.menu-trigger');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                dropdown.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove('open');
                const trigger = dropdown.querySelector('.menu-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        }
    });

    if (mainNav) {
        mainNav.addEventListener('click', (event) => {
            if (!event.target.closest('a')) return;

            mainNav.classList.remove('open');
            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove('open');
                const trigger = dropdown.querySelector('.menu-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const branches = [
        { name: 'Lima', map: 'https://tile.openstreetmap.org/11/585/1093.png' },
        { name: 'Chiclayo', map: 'https://tile.openstreetmap.org/11/569/1062.png' },
        { name: 'Tarapoto', map: 'https://tile.openstreetmap.org/11/589/1060.png' },
        { name: 'Cajamarca', map: 'https://tile.openstreetmap.org/11/577/1064.png' },
        { name: 'Huancayo', map: 'https://tile.openstreetmap.org/11/596/1093.png' }
    ];
    const branchMap = document.getElementById('branchMap');
    const branchName = document.getElementById('branchName');
    const branchCounter = document.getElementById('branchCounter');
    const branchSlide = document.getElementById('branchSlide');
    const branchContact = document.getElementById('branchContact');
    let activeBranch = 0;

    function showBranch(index) {
        activeBranch = (index + branches.length) % branches.length;
        const branch = branches[activeBranch];
        branchMap.src = branch.map;
        branchMap.alt = `Mapa referencial del centro de ${branch.name}`;
        branchName.textContent = branch.name;
        branchCounter.textContent = `${activeBranch + 1} / ${branches.length}`;
        branchContact.dataset.branch = branch.name;
        branchSlide.classList.remove('is-changing');
        void branchSlide.offsetWidth;
        branchSlide.classList.add('is-changing');
    }

    document.getElementById('branchPrevious').addEventListener('click', () => showBranch(activeBranch - 1));
    document.getElementById('branchNext').addEventListener('click', () => showBranch(activeBranch + 1));
    document.querySelectorAll('[data-branch-index]').forEach((link) => {
        link.addEventListener('click', () => showBranch(Number(link.dataset.branchIndex)));
    });

    const productCards = [...document.querySelectorAll('.products-grid .card')];
    const productNames = new Map(productCards.map((card) => [
        card.id,
        card.querySelector('h3').textContent.trim()
    ]));
    const cartStorageKey = 'ventas-online-cart-v1';
    const cartToggle = document.getElementById('cartToggle');
    const cartCount = document.getElementById('cartCount');
    const cartDialog = document.getElementById('cartDialog');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const clearCart = document.getElementById('clearCart');
    const submitOrder = document.getElementById('submitOrder');
    let cart = [];

    try {
        const storedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
        if (Array.isArray(storedCart)) {
            cart = storedCart
                .filter((item) => productNames.has(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0)
                .map((item) => ({ productId: item.productId, quantity: item.quantity }));
        }
    } catch {
        cart = [];
    }

    function saveCart() {
        try {
            localStorage.setItem(cartStorageKey, JSON.stringify(cart));
        } catch {
            // El carrito sigue funcionando durante esta visita aunque el almacenamiento esté bloqueado.
        }
    }

    function renderCart() {
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = String(itemCount);
        cartToggle.setAttribute('aria-label', `Abrir carrito, ${itemCount} productos`);
        cartItems.replaceChildren();
        cartEmpty.hidden = cart.length > 0;
        clearCart.disabled = cart.length === 0;
        submitOrder.disabled = cart.length === 0;

        cart.forEach((item) => {
            const row = document.createElement('li');
            row.className = 'cart-item';

            const name = document.createElement('span');
            name.className = 'cart-item-name';
            name.textContent = productNames.get(item.productId);

            const controls = document.createElement('div');
            controls.className = 'cart-item-controls';

            const decrease = document.createElement('button');
            decrease.className = 'cart-quantity-button';
            decrease.type = 'button';
            decrease.dataset.cartAction = 'decrease';
            decrease.dataset.productId = item.productId;
            decrease.setAttribute('aria-label', `Quitar una unidad de ${name.textContent}`);
            decrease.textContent = '−';

            const quantity = document.createElement('span');
            quantity.textContent = String(item.quantity);
            quantity.setAttribute('aria-label', 'Cantidad');

            const increase = document.createElement('button');
            increase.className = 'cart-quantity-button';
            increase.type = 'button';
            increase.dataset.cartAction = 'increase';
            increase.dataset.productId = item.productId;
            increase.setAttribute('aria-label', `Añadir una unidad de ${name.textContent}`);
            increase.textContent = '+';

            const remove = document.createElement('button');
            remove.className = 'cart-remove';
            remove.type = 'button';
            remove.dataset.cartAction = 'remove';
            remove.dataset.productId = item.productId;
            remove.textContent = 'Eliminar';

            controls.append(decrease, quantity, increase, remove);
            row.append(name, controls);
            cartItems.append(row);
        });
    }

    document.querySelectorAll('.card-button').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.closest('.card').id;
            const item = cart.find((entry) => entry.productId === productId);

            if (item) {
                item.quantity += 1;
            } else {
                cart.push({ productId, quantity: 1 });
            }

            saveCart();
            renderCart();
        });
    });

    cartToggle.addEventListener('click', () => cartDialog.showModal());
    cartClose.addEventListener('click', () => cartDialog.close());

    cartItems.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cart-action]');
        if (!button) return;

        const item = cart.find((entry) => entry.productId === button.dataset.productId);
        if (!item) return;

        if (button.dataset.cartAction === 'increase') item.quantity += 1;
        if (button.dataset.cartAction === 'decrease') item.quantity -= 1;
        if (button.dataset.cartAction === 'remove' || item.quantity <= 0) {
            cart = cart.filter((entry) => entry.productId !== item.productId);
        }

        saveCart();
        renderCart();
    });

    clearCart.addEventListener('click', () => {
        cart = [];
        saveCart();
        renderCart();
    });

    submitOrder.addEventListener('click', () => {
        if (cart.length === 0) return;

        const orderLines = cart.map((item) => `- ${productNames.get(item.productId)}: ${item.quantity}`);
        const message = ['Hola, quisiera consultar precio y disponibilidad para:', ...orderLines].join('\n');
        const whatsappUrl = `https://wa.me/51987654321?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });

    renderCart();

    // El servicio devuelve el QR como imagen y codifica la dirección actual.
    const qrImage = document.getElementById('qrcode');
    const qrLabel = document.getElementById('qrLabel');
    if (qrImage) {
        const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const pageUrl = isLocalHost ? 'http://172.56.0.150:8000/' : window.location.href;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=1&data=${encodeURIComponent(pageUrl)}`;
        if (qrLabel) qrLabel.textContent = pageUrl.replace(/^https?:\/\//, '');
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        document.querySelectorAll('.branch-link').forEach((link) => {
            link.addEventListener('click', () => {
                contactForm.elements.subject.value = 'Consulta sobre una sucursal';
                contactForm.elements.message.value = `Quisiera información sobre la sucursal de ${link.dataset.branch}.`;
            });
        });

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(contactForm);
            const subject = `Consulta: ${formData.get('subject')}`;
            const body = [
                `Nombre: ${formData.get('name')}`,
                `Correo: ${formData.get('email')}`,
                `Motivo: ${formData.get('subject')}`,
                `Cómo desea comprar: ${formData.get('purchaseMethod') || 'Sin especificar'}`,
                '',
                'Mensaje:',
                formData.get('message')
            ].join('\n');
            window.location.href = `mailto:ventas@tienda.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }

    // Chatbot con 50 preguntas frecuentes.
    const faqBank = [
        { keywords: ['precio', 'cuanto cuesta', 'costo', 'precio de', 'valor'], answer: 'Los precios varían según el producto. Puedes revisar las ofertas en la sección de productos o escribir el nombre del artículo para ayudarte mejor.' },
        { keywords: ['envio', 'entrega', 'domicilio', 'shipping', 'delivery'], answer: 'Los envíos se realizan dentro de la ciudad y a otras regiones según disponibilidad. El costo y el tiempo dependen del producto y la ubicación.' },
        { keywords: ['pago', 'metodo de pago', 'formas de pago', 'como pagar'], answer: 'Aceptamos pagos con tarjeta, transferencia, Yape, Plin y efectivo al recoger el pedido.' },
        { keywords: ['garantia', 'warranty', 'seguro'], answer: 'Todos nuestros productos incluyen garantía según la marca y el tipo de equipo. Te podemos indicar los detalles al momento de la compra.' },
        { keywords: ['devolucion', 'reembolso', 'cambio', 'devoluciones'], answer: 'Las devoluciones se revisan según el caso y la condición del producto. Puedes solicitar asistencia en atención al cliente.' },
        { keywords: ['laptop', 'portatil', 'computadora'], answer: 'Tenemos laptops para trabajo, estudio y gaming. Puedes buscar por marca, tamaño de pantalla o rendimiento.' },
        { keywords: ['celular', 'telefono', 'smartphone'], answer: 'Disponemos de celulares de distintas gamas y marcas. También te ayudamos con accesorios y protección.' },
        { keywords: ['impresora', 'printer'], answer: 'Contamos con impresoras láser e inkjet para hogar y oficina. Tenemos opciones para uso personal y empresarial.' },
        { keywords: ['tarjeta grafica', 'gpu', 'video'], answer: 'Las tarjetas gráficas están disponibles para gaming y edición. Puedes consultar la compatibilidad con tu equipo.' },
        { keywords: ['periferico', 'mouse', 'teclado', 'audifonos'], answer: 'Ofrecemos periféricos como mouse, teclado, audífonos, monitores y más para mejorar tu experiencia digital.' },
        { keywords: ['cuotas', 'financiamiento', 'credito', 'aplazo'], answer: 'Puedes pagar en cuotas con ciertos métodos de pago y condiciones según el producto y la promoción vigente.' },
        { keywords: ['horario', 'abierto', 'atención', 'cuando atienden'], answer: 'Atendemos de lunes a sábado de 9:00 a.m. a 6:00 p.m.' },
        { keywords: ['ubicacion', 'direccion', 'sucursal', 'donde estan'], answer: 'Tenemos sucursales en Lima, Chiclayo, Tarapoto, Cajamarca y Huancayo.' },
        { keywords: ['facebook', 'instagram', 'redes', 'social media'], answer: 'Puedes seguirnos en nuestras redes sociales para ver promociones, novedades y atención directa.' },
        { keywords: ['whatsapp', 'mensaje', 'contactar'], answer: 'Puedes contactarnos por WhatsApp para consultas rápidas, pedidos y seguimiento.' },
        { keywords: ['donde comprar', 'comprar online', 'pedido'], answer: 'Puedes hacer tu pedido por la web, por WhatsApp o directamente en nuestra tienda.' },
        { keywords: ['promo', 'oferta', 'descuento', 'rebaja'], answer: 'Las promociones cambian semanalmente. Te sugerimos revisar la sección de productos o seguir nuestras redes sociales.' },
        { keywords: ['reparacion', 'soporte tecnico', 'tecnico', 'servicio'], answer: 'Ofrecemos soporte técnico y asesoría para equipos y accesorios. Consulta con nosotros para revisar el caso.' },
        { keywords: ['como usar', 'manual', 'guia', 'instrucciones'], answer: 'Podemos ayudarte con la instalación y configuración básica de tus equipos y productos.' },
        { keywords: ['hay stock', 'disponibilidad', 'existe'], answer: 'La disponibilidad cambia según el producto. Puedes consultarnos por el modelo exacto para confirmar stock.' },
        { keywords: ['delivery', 'costo de envio', 'envios internacionales'], answer: 'Para envíos locales se revisa el costo según zona. Para envíos internacionales, consulta directamente con atención al cliente.' },
        { keywords: ['mi pedido', 'seguimiento', 'estado del pedido'], answer: 'Puedes pedir información sobre tu pedido con tu nombre y número de referencia para hacer seguimiento.' },
        { keywords: ['cancelar pedido', 'anular compra'], answer: 'Si tu pedido aún no ha sido enviado, se puede revisar la cancelación. Escríbenos lo antes posible.' },
        { keywords: ['regalo', 'obsequio', 'gift'], answer: 'Podemos sugerir opciones de regalo según tu presupuesto y el tipo de persona a quien va dirigido.' },
        { keywords: ['equipo gamer', 'gaming'], answer: 'Tenemos equipos gaming, accesorios y componentes para jugar con mejor rendimiento y calidad visual.' },
        { keywords: ['edicion video', 'edicion', 'video editing'], answer: 'Hay laptops y equipos recomendados para edición de video, diseño y producción multimedia.' },
        { keywords: ['trabajo', 'oficina', 'escritorio'], answer: 'Recomendamos equipos con buen rendimiento para oficina, multitarea y productividad diaria.' },
        { keywords: ['estudio', 'universidad', 'estudiante'], answer: 'Tenemos opciones ligeras y económicas para estudiar, realizar tareas y trabajar con comodidad.' },
        { keywords: ['mantenimiento', 'limpieza', 'servicio tecnico'], answer: 'Puedes solicitar mantenimiento o revisión de equipos para asegurar su correcto funcionamiento.' },
        { keywords: ['accesorio', 'cargador', 'cable'], answer: 'También vendemos accesorios como cargadores, cables, protectores y complementos para tus dispositivos.' },
        { keywords: ['monitor', 'pantalla', 'screen'], answer: 'Disponemos de monitores y pantallas para oficina, estudio y gaming con distintas tecnologías y tamaños.' },
        { keywords: ['soporte', 'ayuda', 'consultas'], answer: 'Nuestro equipo está listo para ayudarte con información de productos, compras y soporte técnico.' },
        { keywords: ['talla', 'medida', 'size'], answer: 'En tecnología no se usa talla como en ropa; lo importante es el modelo, marca y compatibilidad del equipo.' },
        { keywords: ['novedades', 'nuevos productos', 'ultimos lanzamientos'], answer: 'Nuestra tienda actualiza regularmente sus productos. Sigue nuestras redes o consulta por nuevos lanzamientos.' },
        { keywords: ['seguridad', 'paypal', 'tarjeta segura'], answer: 'Trabajamos con procesos seguros para pagos en línea y verificamos que la información se maneje con cuidado.' },
        { keywords: ['computadora para programar', 'programador'], answer: 'Para programación recomendamos equipos con buen procesador, memoria RAM y SSD para mayor velocidad.' },
        { keywords: ['mercado libre', 'amazon', 'tienda online'], answer: 'Nuestra atención y ventas se realizan a través de la web, WhatsApp y nuestra tienda presencial.' },
        { keywords: ['ventas por mayor', 'mayoreo', 'al por mayor'], answer: 'Ofrecemos ventas al mayoreo y para proyectos con condiciones especiales. Consulta con atención comercial.' },
        { keywords: ['precio por mayor', 'cantidad', 'gran volumen'], answer: 'Los precios por volumen dependen de la cantidad, el producto y la negociación. Te ayudamos a cotizar.' },
        { keywords: ['quienes son', 'empresa', 'nosotros'], answer: 'Somos una tienda de tecnología enfocada en ofrecer equipos, accesorios y asesoría para clientes personales y empresariales.' },
        { keywords: ['sucursal lima', 'lima direccion', 'ubicacion lima'], answer: 'Nuestra sucursal en Lima tiene atención presencial y asesoría para compras y consultas.' },
        { keywords: ['sucursal chiclayo', 'chiclayo'], answer: 'En Chiclayo atendemos pedidos y consultas locales con asesoría especializada.' },
        { keywords: ['sucursal tarapoto', 'tarapoto'], answer: 'En Tarapoto también tenemos atención para ventas y soporte técnico de productos tecnológicos.' },
        { keywords: ['sucursal cajamarca', 'cajamarca'], answer: 'Atendemos en Cajamarca con atención para compras presenciales y consultas de productos.' },
        { keywords: ['sucursal huancayo', 'huancayo'], answer: 'En Huancayo contamos con servicio para ventas de equipos y accesorios tecnológicos.' },
        { keywords: ['como comprar', 'quiero comprar', 'orden'], answer: 'Puedes elegir el producto, agregarlo al carrito y confirmar tu pedido por nuestra web o WhatsApp.' },
        { keywords: ['necesito asesoria', 'recomienda', 'me ayudas'], answer: 'Claro, comparte tus necesidades: trabajo, estudio, gaming o negocio, y te recomendaremos opciones adecuadas.' },
        { keywords: ['hola', 'buenas', 'inicio', 'ayuda'], answer: '¡Hola! Estoy aquí para ayudarte con productos, pagos, envíos, garantías y consultas generales.' },
        { keywords: ['gracias', 'adios', 'bye'], answer: '¡De nada! Estoy aquí para ayudarte cuando quieras. Que tengas un excelente día.' },
        { keywords: ['desktop', 'pc', 'computadora de escritorio'], answer: 'También tenemos PCs de escritorio para trabajo, estudio, gaming y uso profesional según tus necesidades.' },
        { keywords: ['resolucion', 'pantalla 4k', 'full hd', 'monitor'], answer: 'Podemos recomendarte pantallas según la resolución, tamaño y uso, como trabajo, gaming o diseño.' },
        { keywords: ['celular barato', 'economico', 'barato', 'presupuesto'], answer: 'Tenemos opciones económicas y de gama media para quienes buscan buen rendimiento sin gastar demasiado.' },
        { keywords: ['laptop para estudiar', 'laptop universitaria'], answer: 'Las laptops para estudiar deben ser ligeras, con buen rendimiento y autonomía. Te recomendaremos según tu carrera.' }
    ];

    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWidget = document.getElementById('chatbotWidget');
    const chatbotPanel = document.getElementById('chatbotPanel');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const sendChatbotMessage = document.getElementById('sendChatbotMessage');

    function addMessage(message, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = message;
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getBotReply(userText) {
        const normalized = userText.toLowerCase();

        for (const item of faqBank) {
            const match = item.keywords.some((keyword) => normalized.includes(keyword));
            if (match) {
                return item.answer;
            }
        }

        return 'Puedo ayudarte con pedidos, pagos, envíos, garantías y productos. Prueba con otra pregunta como: "¿Qué métodos de pago aceptan?" o "¿Qué horarios tienen?"';
    }

    function sendMessage() {
        const text = chatbotInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatbotInput.value = '';

        const reply = getBotReply(text);
        setTimeout(() => addMessage(reply, 'bot'), 250);
    }

    chatbotToggle.addEventListener('click', () => {
        chatbotWidget.classList.toggle('open');
        if (chatbotWidget.classList.contains('open')) {
            chatbotInput.focus();
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWidget.classList.remove('open');
    });

    sendChatbotMessage.addEventListener('click', sendMessage);

    chatbotInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});
