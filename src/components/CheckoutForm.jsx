import React, { useState } from 'react';
import { ArrowLeft, User, MapPin, CreditCard, Truck, ShoppingBag, Send, FileText, LoaderCircle, TicketPercent } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const cleanedValue = value.replace('R$', '').trim().replace(',', '.');
    return isNaN(parseFloat(cleanedValue)) ? 0 : parseFloat(cleanedValue);
};

// --- Sub-componentes de UI Refinados ---

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-3 border-b pb-3 mb-4">
        {React.cloneElement(icon, { className: "text-primary", size: 22 })}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input 
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            {...props} 
        />
    </div>
);

const OptionButton = ({ icon, label, isSelected, ...props }) => (
    <button 
        type="button"
        className={`w-full flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 text-sm ${isSelected ? 'bg-primary/10 border-primary font-bold' : 'bg-white border-gray-200 hover:border-gray-300'}`}
        {...props}
    >
        {icon}
        <span className={`${isSelected ? 'text-primary' : 'text-gray-700'}`}>{label}</span>
    </button>
);

// --- Componente Principal do Checkout ---

export const CheckoutForm = ({ cart, onBackToMenu, restaurantData, showToast }) => {
    // GUARDA DE SEGURANÇA: Se o carrinho ou os dados do restaurante não estiverem prontos, não renderiza.
    if (!cart || !restaurantData) {
        return null; // Evita o erro "Cannot read properties of undefined"
    }
    
    const [deliveryType, setDeliveryType] = useState('pickup');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [couponCode, setCouponCode] = useState('');

    const deliveryFee = deliveryType === 'delivery' ? parseCurrency(restaurantData?.customizations['Taxa Entrega'] || '0') : 0;
    const finalTotal = cart.total + deliveryFee;

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        const success = cart.applyCoupon(couponCode, restaurantData.coupons);
        if (success) {
            showToast('Cupom aplicado com sucesso!');
        } else {
            showToast('Cupom inválido ou expirado.');
        }
    };

    const handlePixClick = () => {
        setPaymentMethod('pix');
        const pixCode = restaurantData.customizations['Código PIX'];
        if (pixCode) {
            navigator.clipboard.writeText(pixCode).then(() => {
                showToast('Código PIX Copiado!');
            }).catch(err => {
                console.error('Falha ao copiar o código PIX:', err);
                showToast('Erro ao copiar o código.');
            });
        }
    };

    const paymentMethodMap = { credit: 'Cartão de Crédito', debit: 'Cartão de Débito', pix: 'PIX', cash: 'Dinheiro' };

    // NOTA: Para que os emojis funcionem, este ficheiro DEVE ser guardado com a codificação UTF-8.
    const generateWhatsAppMessage = (orderData, cart, deliveryFee, finalTotal, formatCurrency) => {
        const messageParts = [];

        messageParts.push(`📱 *PEDIDO NA TELA DA FOME!* 😋`);
        messageParts.push(``);
        messageParts.push(`*👤 Cliente:* ${orderData.customerName}`);
        messageParts.push(``);

        messageParts.push(`*🛒 Pedido:*`);
        orderData.cart.forEach(item => {
            messageParts.push(`• ${item.mainQuantity}x *${item.product.Nome}*`);
            if (item.options.length > 0) {
                item.options.forEach(opt => {
                    messageParts.push(`   └ ${opt.quantity}x ${opt.Nome}`);
                });
            }
        });

        if (orderData.observations) {
            messageParts.push(``);
            messageParts.push(`*✏️ Observações:*`);
            messageParts.push(`_${orderData.observations}_`);
        }

        messageParts.push(``);
        messageParts.push(`*💰 Resumo do Pagamento:*`);
        messageParts.push(`Subtotal: ${formatCurrency(cart.subtotal)}`);
        if (cart.discount > 0) {
            messageParts.push(`Desconto (${cart.coupon['Código']}): -${formatCurrency(cart.discount)}`);
        }
        if (orderData.deliveryType === 'delivery') {
            messageParts.push(`Taxa de entrega: ${formatCurrency(deliveryFee)}`);
        }
        messageParts.push(`➡️ *Total: ${formatCurrency(finalTotal)}*`);
        messageParts.push(``);

        messageParts.push(`*💳 Forma de Pagamento:*`);
        messageParts.push(paymentMethodMap[orderData.paymentMethod] || orderData.paymentMethod);
        
        if (orderData.paymentMethod === 'pix') {
            const pixCode = restaurantData.customizations['Código PIX'];
            if (pixCode) {
                messageParts.push(`*Chave PIX:* ${pixCode}`);
                messageParts.push(`_(Por favor, envie o comprovante após o pagamento)_`);
            }
        }

        if (orderData.deliveryType === 'delivery') {
            messageParts.push(``);
            messageParts.push(`*📍 Endereço de Entrega:*`);
            messageParts.push(`${orderData.address}`);
        } else {
            messageParts.push(``);
            messageParts.push(`*🛍️ Retirada:*`);
            messageParts.push(`No local`);
        }

        messageParts.push(``);
        messageParts.push(`✅ Pedido enviado com sucesso!`);
        messageParts.push(`Aguarde nossa confirmação. Obrigado pela preferência! 🙏😊`);

        return messageParts.join('\n');
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentMethod) {
            showToast('Por favor, selecione uma forma de pagamento.');
            return;
        }
        setIsSubmitting(true);
        const formData = new FormData(e.target);

        const orderData = {
            customerName: formData.get('customerName'),
            deliveryType,
            address: deliveryType === 'delivery' ? formData.get('address') : null,
            paymentMethod,
            observations: formData.get('observations'),
            cart: cart.items,
            subtotal: cart.subtotal,
            deliveryFee,
            discount: cart.discount,
            coupon: cart.coupon?.['Código'],
            total: finalTotal
        };

        try {
            const slug = window.location.pathname.replace('/', '') || 'ruachdelivery';
            // Aponta para a API centralizada
            const response = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderData, slug })
            });

            if (!response.ok) throw new Error('Falha ao salvar o pedido no servidor.');

            // CORREÇÃO AQUI: Passando todos os argumentos necessários para a função.
            const whatsappMessage = generateWhatsAppMessage(orderData, cart, deliveryFee, finalTotal, formatCurrency);
            const whatsappNumber = restaurantData.customizations.Whatsapp;
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodedMessage}`;

            window.location.href = whatsappUrl;

        } catch (error) {
            console.error(error);
            showToast('Erro ao finalizar o pedido. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 py-3">
                        <button onClick={onBackToMenu} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ArrowLeft className="text-gray-700" /></button>
                        <h2 className="text-xl font-bold text-gray-800">Finalizar Pedido</h2>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-2 sm:p-4">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-start">

                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm"><SectionHeader icon={<User />} title="Seus Dados" /><InputField label="Seu nome" name="customerName" placeholder="Digite seu nome completo" required /></div>
                        <div className="bg-white p-4 rounded-lg shadow-sm"><SectionHeader icon={<Truck />} title="Entrega" /><div className="grid grid-cols-2 gap-3 mb-4"><OptionButton icon={<ShoppingBag size={18} />} label="Retirar" isSelected={deliveryType === 'pickup'} onClick={() => setDeliveryType('pickup')} /><OptionButton icon={<Truck size={18} />} label="Delivery" isSelected={deliveryType === 'delivery'} onClick={() => setDeliveryType('delivery')} /></div>{deliveryType === 'delivery' && (<div className="animate-fadeIn"><InputField label="Endereço de entrega" name="address" placeholder="Rua, Número, Bairro" required /></div>)}</div>
                        <div className="bg-white p-4 rounded-lg shadow-sm"><SectionHeader icon={<TicketPercent />} title="Cupom de Desconto" /><div className="flex gap-2"><InputField label="Código do cupom" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} /><button type="button" onClick={handleApplyCoupon} className="bg-gray-200 text-gray-800 font-semibold px-4 rounded-lg self-end h-[46px] hover:bg-gray-300">Aplicar</button></div></div>
                        <div className="bg-white p-4 rounded-lg shadow-sm"><SectionHeader icon={<CreditCard />} title="Pagamento" /><div className="grid grid-cols-2 gap-3"><OptionButton icon={<CreditCard size={18} />} label="Crédito" isSelected={paymentMethod === 'credit'} onClick={() => setPaymentMethod('credit')} /><OptionButton icon={<CreditCard size={18} />} label="Débito" isSelected={paymentMethod === 'debit'} onClick={() => setPaymentMethod('debit')} /><OptionButton icon={<CreditCard size={18} />} label="PIX" isSelected={paymentMethod === 'pix'} onClick={handlePixClick} /><OptionButton icon={<CreditCard size={18} />} label="Dinheiro" isSelected={paymentMethod === 'cash'} onClick={() => setPaymentMethod('cash')} /></div></div>
                        <div className="bg-white p-4 rounded-lg shadow-sm"><SectionHeader icon={<FileText />} title="Observações" /><InputField label="Algo que precisamos saber?" name="observations" placeholder="Ex: tirar a cebola, troco para R$50..." /></div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow-sm sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Resumo</h2>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-4">
                                {cart.items.map(item => (<div key={item.cartId} className="flex justify-between items-start text-sm"><p className="text-gray-700 flex-1"><span className="font-semibold text-gray-800">{item.mainQuantity}x</span> {item.product.Nome}</p><p className="text-gray-600 font-medium whitespace-nowrap">{formatCurrency(item.totalPrice)}</p></div>))}
                            </div>
                            <div className="border-t pt-3 space-y-1">
                                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
                                {cart.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Desconto</span><span>-{formatCurrency(cart.discount)}</span></div>}
                                <div className="flex justify-between text-sm text-gray-600"><span>Taxa de Entrega</span><span>{formatCurrency(deliveryFee)}</span></div>
                                <div className="flex justify-between font-bold text-base text-gray-800 mt-2"><span>Total</span><span>{formatCurrency(finalTotal)}</span></div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full mt-5 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send size={18} />}
                                {isSubmitting ? 'Enviando...' : 'Finalizar Pedido'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

