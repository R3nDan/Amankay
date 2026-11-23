"use client";
/* eslint-disable react-hooks/refs -- Refs are attached to DOM nodes with createElement and read only in event handlers/effects. */

import { createContext, createElement, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/** @typedef {"es-CO" | "en" | "pt-BR"} Locale */

const english = {
  "Saltar al contenido": "Skip to content",
  "Navegación principal": "Main navigation",
  "Contáctanos": "Contact us",
  "Inicio": "Home",
  "Amankay, volver al inicio": "Amankay, back to home",
  "Panadería, fritos y bebidas en Neiva.": "Bakery, fried snacks, and drinks in Neiva.",
  "Explora": "Explore",
  "Catálogo": "Menu",
  "Acerca de nosotros": "About us",
  "El oficio del pan": "The craft of bread",
  "Visítanos": "Visit us",
  "Domingos y festivos · Cerrado": "Sundays and holidays · Closed",
  "Lun–vie": "Mon–Fri",
  "Sáb": "Sat",
  "Explora Amankay": "Explore Amankay",
  "Volver arriba ↑": "Back to top ↑",
  "Pan del día.": "Fresh bread today.",
  "Y algo más.": "And a little more.",
  "Ver el proceso": "See how it is made",
  "Ver el catálogo": "Browse the menu",
  "Pide: abrir la bolsa": "Open your bag",
  "productos": "items",
  "Tu bolsa": "Your bag",
  "Cerrar bolsa": "Close bag",
  "Solicitud enviada": "Request sent",
  "La bolsa quedó libre. Amankay confirmará disponibilidad y valor final por WhatsApp.": "Your bag is clear. Amankay will confirm availability and the final price on WhatsApp.",
  "Seguir explorando": "Keep browsing",
  "¿Ya enviaste tu solicitud?": "Did you send your request?",
  "Envía el mensaje preparado en WhatsApp; al confirmar aquí que lo enviaste, liberaremos la bolsa.": "Send the prepared WhatsApp message, then confirm here to clear your bag.",
  "Abrir WhatsApp de nuevo": "Reopen WhatsApp",
  "Sí, ya lo envié": "Yes, I sent it",
  "Subtotal": "Subtotal",
  "Total estimado": "Estimated total",
  "¿Cómo quieres recibirlo?": "How would you like to receive your order?",
  "Recoger": "Pickup",
  "Domicilio": "Delivery",
  "Sucursal para recoger": "Pickup location",
  "Barrio en Neiva": "Neighborhood in Neiva",
  "¿Cómo prefieres pagar?": "How would you like to pay?",
  "Efectivo": "Cash",
  "Transferencia": "Bank transfer",
  "Nombre": "Name",
  "Dirección en Neiva": "Address in Neiva",
  "Referencia para la entrega": "Delivery reference",
  "Domicilios disponibles solo para Neiva, la tarifa es de 2.000 pesos adicionales, y la disponibilidad se confirma al atender su solicitud.": "Delivery is available only in Neiva, with a COP 2,000 fee. Availability is confirmed when your request is reviewed.",
  "Al continuar se abrirá WhatsApp con tu solicitud. Amankay confirmará precio final y disponibilidad antes de aceptar el pedido.": "Continuing opens WhatsApp with your request. Amankay will confirm the final price and availability before accepting the order.",
  "No se pudo registrar el pedido. La bolsa sigue intacta.": "We could not save the order. Your bag is unchanged.",
  "Permite las ventanas emergentes para continuar a WhatsApp; tu pedido no se registró y la bolsa sigue intacta.": "Allow pop-ups to continue to WhatsApp. Your order was not saved and your bag is unchanged.",
  "Enviar solicitud por WhatsApp": "Send request on WhatsApp",
  "Registrando pedido…": "Saving your order…",
  "Tu bolsa espera algo rico.": "Your bag is waiting for something delicious.",
  "Explorar el catálogo": "Browse the menu",
  "ESPACIO DEL EQUIPO": "TEAM WORKSPACE",
  "Bienvenido": "Welcome",
  "de nuevo.": "back.",
  "Ingresa con tu cuenta de personal para continuar la jornada.": "Sign in with your staff account to continue.",
  "Correo electrónico": "Email address",
  "Contraseña": "Password",
  "Entrando…": "Signing in…",
  "Entrar al panel": "Open dashboard",
  "Volver al sitio público": "Back to the public site",
  "Amankay, inicio del panel": "Amankay, dashboard home",
  "Espacio de trabajo": "Workspace",
  "Panel administrativo": "Admin panel",
  "Pedidos": "Orders",
  "Inventario": "Inventory",
  "Reposiciones": "Restocking",
  "Entregas": "Deliveries",
  "Pagos": "Payments",
  "Conciliaciones": "Reconciliation",
  "Usuarios": "Users",
  "Sucursales": "Locations",
  "Reportes": "Reports",
  "Mesas y QR": "Tables & QR",
  "Sucursal": "Location",
  "Cerrar sesión": "Sign out",
  "Preparando tu espacio…": "Preparing your workspace…",
  "Reintentar": "Try again",
  "de la mesa": "for this table",
  "Panadería": "Bakery",
  "Fritos": "Fried snacks",
  "Bebidas": "Drinks",
  "Precio unitario": "Unit price",
  "Total · ": "Total · ",
  "unidad": "unit",
  "unidades": "units",
  "Quitar uno": "Remove one",
  "Agregar uno": "Add one",
  "No hay productos disponibles por ahora.": "No products are available right now.",
  "Idioma": "Language",
  "Los buenos momentos": "Good moments",
  "se comparten.": "are shared.",
  "Pronto, en imágenes.": "Photos coming soon.",
  "Ver ": "View ",
  " y agregar a la bolsa": " and add to bag",
  "Cantidad de ": "Quantity of ",
  "Categorías": "Categories",
  "Preparando tu mesa…": "Preparing your table…",
  "Tu mesa te espera.": "Your table is ready.",
  "Pide al personal que abra la sesión y te muestre el QR temporal de acceso.": "Ask a staff member to open the session and show you its temporary access QR code.",
  "Pedido enviado. El equipo confirmará su preparación.": "Order sent. The team will confirm it shortly.",
  "No se pudo comprobar la mesa.": "We could not verify this table.",
  "No se pudo actualizar la mesa.": "We could not refresh this table.",
  "No se pudo enviar el pedido.": "We could not send the order.",
  "Todos": "All",
  "Aún no hay pedidos asociados a esta mesa. Cuando envíes uno, podrás seguir aquí su estado y total.": "There are no orders for this table yet. Once you place one, you can check its status and total here.",
  "Ver pedido": "View order",
  "Revisar pedido": "Review order",
  "Cerrar resumen": "Close summary",
  "Tu pedido.": "Your order.",
  "Enviar a la mesa": "Send to the table",
  "Enviando…": "Sending…",
  "Pendiente de confirmación": "Awaiting confirmation",
  "Aceptado": "Accepted",
  "En preparación": "Being prepared",
  "Listo": "Ready",
  "Completado": "Completed",
  "Rechazado": "Declined",
  "Cancelación solicitada": "Cancellation requested",
  "Cancelado": "Cancelled",
  "Vencido": "Expired",
  "Nuestro": "Our",
  "catálogo.": "menu.",
  "Panadería, fritos y bebidas para elegir lo que más se te antoje.": "Bakery, fried snacks, and drinks for whatever you are craving.",
  "Ver panadería": "Explore the bakery",
  "Ver fritos": "Explore fried snacks",
  "Ver bebidas": "Explore drinks",
  "Horario de atención": "Opening hours",
  "Horario": "Hours",
  "Lunes a viernes": "Monday to Friday",
  "Sábados": "Saturdays",
  "Domingos y festivos": "Sundays and holidays",
  "Cerrado": "Closed",
  "Teléfono": "Phone",
  "Pedido ": "Order ",
  "Actualizar": "Refresh",
  "Escribir por WhatsApp a ": "Message ",
  "Sede principal": "Main location",
  "Sede secundaria": "Secondary location",
  "Pan de queso": "Cheese bread",
  "Croissant": "Croissant",
  "Mojicón de bocadillo": "Guava-paste sweet roll",
  "Pan hawaiano": "Hawaiian bread",
  "Pan de salchicha": "Sausage roll",
  "Pan agridulce": "Sweet-and-savory bread",
  "Mojicón de queso": "Cheese sweet roll",
  "Mojicón de arequipe y queso": "Caramel and cheese sweet roll",
  "Empanada": "Empanada",
  "Arepa de huevo": "Egg-filled arepa",
  "Pastel de carne": "Beef pastry",
  "Pastel de chorizo": "Chorizo pastry",
  "Pastel de huevo": "Egg pastry",
  "Pastel mixto": "Mixed-fill pastry",
  "Pastel de pollo": "Chicken pastry",
  "Avena": "Oat drink",
  "Sevillana": "Sevillana drink",
  "Guarapo": "Guarapo",
  "Miga tierna y dorado apetitoso: un clásico para disfrutar sin afán.": "Soft crumb and a golden finish: a classic to enjoy at your own pace.",
  "Capas delicadas, exterior dorado y forma de media luna irresistible.": "Delicate layers, a golden exterior, and an irresistible crescent shape.",
  "Suave por dentro, doradito por fuera y con el dulce sabor del bocadillo.": "Soft inside, golden outside, with the sweet taste of guava paste.",
  "Un pan suave y dorado, perfecto para darle un toque especial a la pausa.": "A soft, golden bread to make your break a little more special.",
  "Pan suave con salchicha: práctico, sabroso y listo para disfrutar.": "Soft bread with sausage: handy, tasty, and ready to enjoy.",
  "Un bocado de contraste entre notas dulces y saladas, con miga suave.": "A soft bite with a balance of sweet and savory notes.",
  "Mojicón dorado con queso: pequeño, suave y lleno de sabor.": "A golden cheese roll: small, soft, and full of flavor.",
  "El encuentro del arequipe y el queso en un mojicón tierno y doradito.": "Caramel and cheese come together in a tender, golden roll.",
  "Masa crujiente, forma clásica y un relleno que invita a otro mordisco.": "Crisp pastry, a classic shape, and a filling that calls for another bite.",
  "Arepa dorada y crujiente, con huevo en el corazón de cada bocado.": "A crisp, golden arepa with egg at the heart of every bite.",
  "Masa doradita y relleno de carne: un frito contundente para cualquier pausa.": "Golden pastry with a hearty beef filling for any break.",
  "Crujiente por fuera y con el sabor intenso del chorizo en su interior.": "Crisp outside, with the bold flavor of chorizo inside.",
  "Una cubierta dorada guarda un relleno sencillo y sabroso de huevo.": "A golden crust wraps a simple, savory egg filling.",
  "Una mezcla de sabores envuelta en masa crujiente, ideal para abrir el apetito.": "A mix of flavors wrapped in crisp pastry, perfect for whetting your appetite.",
  "Pollo envuelto en una masa dorada y crujiente, perfecto para cualquier pausa.": "Chicken wrapped in golden, crisp pastry, perfect for any break.",
  "Suave y refrescante, acompaña muy bien una pausa con pan o algo frito.": "Smooth and refreshing, it pairs well with bread or a savory snack.",
  "Una bebida tradicional, fresca y lista para acompañar tus antojos.": "A traditional, refreshing drink to go with your favorite bite.",
  "Fresco y sencillo: el compañero ideal para bajar el calor y seguir disfrutando.": "Fresh and simple: a lovely way to cool down and keep enjoying your day.",
  "¿Qué se te ": "What are you ",
  "antoja hoy?": "craving today?",
  "Explorar categorías": "Explore categories",
  "Pan de queso recién horneado": "Freshly baked cheese bread",
  "Empanada dorada": "Golden empanada",
  "Avena servida en vaso": "Oat drink served in a cup",
  "Panes, croissants y mojicones.": "Breads, croissants, and sweet rolls.",
  "Cortezas doradas, miga suave y algo rico para compartir.": "Golden crusts, soft crumbs, and something lovely to share.",
  "Empanadas y pasteles.": "Empanadas and savory pastries.",
  "Empanadas y pasteles: descubre esta parte de nuestra selección.": "Empanadas and savory pastries: discover this part of our menu.",
  "Avena, sevillana y guarapo.": "Oat drinks, sevillana, and guarapo.",
  "Avena, sevillana y guarapo para acompañar tu elección.": "Oat drinks, sevillana, and guarapo to go with your choice.",
  "Acerca de ": "About ",
  "nosotros.": "us.",
  "Un lugar para encontrarnos alrededor de algo rico.": "A place to come together over something delicious.",
  "En Amankay reunimos panes, fritos y bebidas para distintos momentos del día. Nuestra sede principal está en el centro de Neiva; aquí puedes conocer lo que ofrecemos y elegir lo que más se te antoje.": "At Amankay, we bring together breads, savory snacks, and drinks for every part of the day. Our main location is in downtown Neiva; explore our menu and choose what you are craving.",
  "Conoce nuestra sede": "Find our location",
  "Así toma": "How bread",
  "forma": "takes",
  "el pan.": "shape.",
  "Video en bucle del proceso de elaboración del pan": "Looping video of the bread-making process",
  "No se pudo cargar el video.": "The video could not be loaded.",
  "Abrir el clip directamente": "Open the clip directly",
  "Textura de ": "Decorative pattern for",
  "Agregar a la bolsa": "Add to bag",
  "Buen día,": "Good morning,",
  "TU JORNADA EN AMANKAY": "YOUR DAY AT AMANKAY",
  "Información actual de tu operación en ": "Current operational information for ",
  "Actualizando…": "Updating…",
  "Datos de la API": "Live API data",
  "OPERACIÓN": "OPERATIONS",
  "ACCESO": "ACCESS",
  "Selecciona una sucursal para comenzar.": "Select a location to get started.",
  "Atender pedidos": "Handle orders",
  "Todo en su lugar.": "Everything in its place.",
  "Tu cuenta muestra las áreas de sus roles. Java vuelve a comprobar los permisos y la sucursal en cada operación.": "Your account shows the areas allowed by your roles. Java rechecks permissions and location for every operation.",
  "Gestionar mesas": "Manage tables",
  "Atención en este momento": "Needs attention now",
  "Por confirmar": "Awaiting confirmation",
  "Más de 3 minutos": "Over 3 minutes",
  "Mesas con sesión": "Tables with an active session",
  "Entregas en curso": "Deliveries in progress",
  "Inventario y reposiciones": "Inventory and restocking",
  "Productos con inventario": "Products with stock",
  "Con 5 unidades o menos": "5 units or fewer",
  "Reposiciones en curso": "Restocking in progress",
  "El umbral de 5 unidades es una referencia visual del tablero; no cambia las reglas de inventario.": "The 5-unit threshold is a visual dashboard reference; it does not change inventory rules.",
  "Mis entregas": "My deliveries",
  "Asignadas o en camino": "Assigned or in transit",
  "Desde aquí podrás acceder a la configuración y los reportes autorizados para tu rol.": "From here you can access the settings and reports allowed for your role.",
  "Manos amasando la masa sobre una mesa enharinada": "Hands kneading dough on a floured table",
  "Manos dando forma a una pieza de masa": "Hands shaping a piece of dough",
  "Panes dorados dentro del horno": "Golden bread inside the oven",
  "Panes recién horneados listos para compartir": "Freshly baked bread ready to share",
  "Este acceso temporal corresponde a otra mesa.": "This temporary access belongs to a different table.",
  "No se pudo cerrar la sesión.": "Could not sign out.",
  "No se pudo cargar el tablero.": "Could not load the dashboard.",
  "La sesión no está disponible.": "The session is unavailable.",
};

/** @type {Record<string, string>} */
const portuguese = {
  "Saltar al contenido": "Pular para o conteúdo", "Navegación principal": "Navegação principal", "Contáctanos": "Fale conosco",
  "Inicio": "Início", "Amankay, volver al inicio": "Amankay, voltar ao início", "Panadería, fritos y bebidas en Neiva.": "Padaria, salgados e bebidas em Neiva.",
  "Explora": "Explore", "Catálogo": "Cardápio", "Acerca de nosotros": "Sobre nós", "El oficio del pan": "A arte de fazer pão", "Visítanos": "Visite-nos",
  "Domingos y festivos · Cerrado": "Domingos e feriados · Fechado", "Lun–vie": "Seg–sex", "Sáb": "Sáb", "Explora Amankay": "Explore a Amankay",
  "Volver arriba ↑": "Voltar ao topo ↑", "Pan del día.": "Pão do dia.", "Y algo más.": "E muito mais.", "Ver el proceso": "Veja o processo",
  "Ver el catálogo": "Ver o cardápio", "Pide: abrir la bolsa": "Peça: abrir a sacola", "productos": "produtos", "Tu bolsa": "Sua sacola",
  "Cerrar bolsa": "Fechar sacola", "Solicitud enviada": "Solicitação enviada", "La bolsa quedó libre. Amankay confirmará disponibilidad y valor final por WhatsApp.": "A sacola foi esvaziada. A Amankay confirmará a disponibilidade e o valor final pelo WhatsApp.",
  "Seguir explorando": "Continuar explorando", "¿Ya enviaste tu solicitud?": "Você já enviou sua solicitação?", "Envía el mensaje preparado en WhatsApp; al confirmar aquí que lo enviaste, liberaremos la bolsa.": "Envie a mensagem preparada no WhatsApp e confirme aqui para esvaziar a sacola.",
  "Abrir WhatsApp de nuevo": "Abrir o WhatsApp novamente", "Sí, ya lo envié": "Sim, já enviei", "Subtotal": "Subtotal", "Total estimado": "Total estimado",
  "¿Cómo quieres recibirlo?": "Como deseja receber o pedido?", "Recoger": "Retirada", "Domicilio": "Entrega", "Sucursal para recoger": "Local de retirada",
  "Barrio en Neiva": "Bairro em Neiva", "¿Cómo prefieres pagar?": "Como prefere pagar?", "Efectivo": "Dinheiro", "Transferencia": "Transferência",
  "Nombre": "Nome", "Dirección en Neiva": "Endereço em Neiva", "Referencia para la entrega": "Referência para a entrega",
  "Domicilios disponibles solo para Neiva, la tarifa es de 2.000 pesos adicionales, y la disponibilidad se confirma al atender su solicitud.": "Entregas disponíveis somente em Neiva, com taxa adicional de COP 2.000. A disponibilidade será confirmada ao analisar sua solicitação.",
  "Al continuar se abrirá WhatsApp con tu solicitud. Amankay confirmará precio final y disponibilidad antes de aceptar el pedido.": "Ao continuar, o WhatsApp será aberto com sua solicitação. A Amankay confirmará o preço final e a disponibilidade antes de aceitar o pedido.",
  "No se pudo registrar el pedido. La bolsa sigue intacta.": "Não foi possível registrar o pedido. Sua sacola continua intacta.",
  "Permite las ventanas emergentes para continuar a WhatsApp; tu pedido no se registró y la bolsa sigue intacta.": "Permita janelas pop-up para continuar no WhatsApp; seu pedido não foi registrado e a sacola continua intacta.",
  "Enviar solicitud por WhatsApp": "Enviar solicitação pelo WhatsApp", "Registrando pedido…": "Registrando pedido…", "Tu bolsa espera algo rico.": "Sua sacola espera algo gostoso.", "Explorar el catálogo": "Explorar o cardápio",
  "ESPACIO DEL EQUIPO": "ESPAÇO DA EQUIPE", "Bienvenido": "Bem-vindo", "de nuevo.": "de volta.", "Ingresa con tu cuenta de personal para continuar la jornada.": "Entre com sua conta de funcionário para continuar o trabalho.",
  "Correo electrónico": "E-mail", "Contraseña": "Senha", "Entrando…": "Entrando…", "Entrar al panel": "Acessar o painel", "Volver al sitio público": "Voltar ao site público",
  "Amankay, inicio del panel": "Amankay, início do painel", "Espacio de trabajo": "Espaço de trabalho", "Panel administrativo": "Painel administrativo", "Pedidos": "Pedidos",
  "Inventario": "Estoque", "Reposiciones": "Reposições", "Entregas": "Entregas", "Pagos": "Pagamentos", "Conciliaciones": "Conciliações", "Usuarios": "Usuários",
  "Sucursales": "Filiais", "Reportes": "Relatórios", "Mesas y QR": "Mesas e QR", "Sucursal": "Filial", "Cerrar sesión": "Sair", "Preparando tu espacio…": "Preparando seu espaço…", "Reintentar": "Tentar novamente",
  "de la mesa": "da mesa", "Panadería": "Padaria", "Fritos": "Salgados", "Bebidas": "Bebidas", "Precio unitario": "Preço unitário", "Total · ": "Total · ", "unidad": "unidade", "unidades": "unidades",
  "Quitar uno": "Remover um", "Agregar uno": "Adicionar um", "No hay productos disponibles por ahora.": "Não há produtos disponíveis no momento.", "Idioma": "Idioma", "Los buenos momentos": "Os bons momentos", "se comparten.": "são compartilhados.",
  "Pronto, en imágenes.": "Em breve, em imagens.", "Ver ": "Ver ", " y agregar a la bolsa": " e adicionar à sacola", "Cantidad de ": "Quantidade de ", "Categorías": "Categorias", "Preparando tu mesa…": "Preparando sua mesa…",
  "Tu mesa te espera.": "Sua mesa está esperando por você.", "Pide al personal que abra la sesión y te muestre el QR temporal de acceso.": "Peça a um funcionário para abrir a sessão e mostrar o QR temporário de acesso.",
  "Pedido enviado. El equipo confirmará su preparación.": "Pedido enviado. A equipe confirmará o preparo.", "No se pudo comprobar la mesa.": "Não foi possível verificar a mesa.", "No se pudo actualizar la mesa.": "Não foi possível atualizar a mesa.", "No se pudo enviar el pedido.": "Não foi possível enviar o pedido.",
  "Todos": "Todos", "Aún no hay pedidos asociados a esta mesa. Cuando envíes uno, podrás seguir aquí su estado y total.": "Ainda não há pedidos associados a esta mesa. Depois de enviar um, você poderá acompanhar o status e o total aqui.",
  "Ver pedido": "Ver pedido", "Revisar pedido": "Revisar pedido", "Cerrar resumen": "Fechar resumo", "Tu pedido.": "Seu pedido.", "Enviar a la mesa": "Enviar para a mesa", "Enviando…": "Enviando…",
  "Pendiente de confirmación": "Aguardando confirmação", "Aceptado": "Aceito", "En preparación": "Em preparo", "Listo": "Pronto", "Completado": "Concluído", "Rechazado": "Recusado", "Cancelación solicitada": "Cancelamento solicitado", "Cancelado": "Cancelado", "Vencido": "Expirado",
  "Nuestro": "Nosso", "catálogo.": "cardápio.", "Panadería, fritos y bebidas para elegir lo que más se te antoje.": "Padaria, salgados e bebidas para escolher o que você mais deseja.", "Ver panadería": "Ver padaria", "Ver fritos": "Ver salgados", "Ver bebidas": "Ver bebidas",
  "Horario de atención": "Horário de atendimento", "Horario": "Horário", "Lunes a viernes": "De segunda a sexta", "Sábados": "Sábados", "Domingos y festivos": "Domingos e feriados", "Cerrado": "Fechado", "Teléfono": "Telefone", "Pedido ": "Pedido ", "Actualizar": "Atualizar", "Escribir por WhatsApp a ": "Enviar mensagem pelo WhatsApp para ", "Sede principal": "Filial principal", "Sede secundaria": "Filial secundária",
  "Pan de queso": "Pão de queijo", "Croissant": "Croissant", "Mojicón de bocadillo": "Pão doce de goiabada", "Pan hawaiano": "Pão havaiano", "Pan de salchicha": "Pão com salsicha", "Pan agridulce": "Pão agridoce", "Mojicón de queso": "Pão doce de queijo", "Mojicón de arequipe y queso": "Pão doce de doce de leite e queijo", "Empanada": "Empanada", "Arepa de huevo": "Arepa com ovo", "Pastel de carne": "Pastel de carne", "Pastel de chorizo": "Pastel de chouriço", "Pastel de huevo": "Pastel de ovo", "Pastel mixto": "Pastel misto", "Pastel de pollo": "Pastel de frango", "Avena": "Bebida de aveia", "Sevillana": "Bebida sevillana", "Guarapo": "Guarapo",
  "Miga tierna y dorado apetitoso: un clásico para disfrutar sin afán.": "Massa macia e dourada: um clássico para saborear sem pressa.", "Capas delicadas, exterior dorado y forma de media luna irresistible.": "Camadas delicadas, exterior dourado e um irresistível formato de meia-lua.", "Suave por dentro, doradito por fuera y con el dulce sabor del bocadillo.": "Macio por dentro, dourado por fora e com o sabor doce da goiabada.", "Un pan suave y dorado, perfecto para darle un toque especial a la pausa.": "Um pão macio e dourado, perfeito para deixar sua pausa ainda melhor.",
  "Pan suave con salchicha: práctico, sabroso y listo para disfrutar.": "Pão macio com salsicha: prático, saboroso e pronto para saborear.", "Un bocado de contraste entre notas dulces y saladas, con miga suave.": "Uma combinação de sabores doces e salgados, com massa macia.", "Mojicón dorado con queso: pequeño, suave y lleno de sabor.": "Pão doce dourado com queijo: pequeno, macio e cheio de sabor.", "El encuentro del arequipe y el queso en un mojicón tierno y doradito.": "Doce de leite e queijo se encontram em um pãozinho macio e dourado.",
  "Masa crujiente, forma clásica y un relleno que invita a otro mordisco.": "Massa crocante, formato clássico e um recheio que pede mais uma mordida.", "Arepa dorada y crujiente, con huevo en el corazón de cada bocado.": "Arepa dourada e crocante, com ovo no centro de cada mordida.", "Masa doradita y relleno de carne: un frito contundente para cualquier pausa.": "Massa dourada e recheio de carne: um salgado reforçado para qualquer pausa.", "Crujiente por fuera y con el sabor intenso del chorizo en su interior.": "Crocante por fora, com o sabor marcante do chouriço por dentro.", "Una cubierta dorada guarda un relleno sencillo y sabroso de huevo.": "Uma massa dourada envolve um recheio simples e saboroso de ovo.", "Una mezcla de sabores envuelta en masa crujiente, ideal para abrir el apetito.": "Uma mistura de sabores envolvida em massa crocante, ideal para abrir o apetite.", "Pollo envuelto en una masa dorada y crujiente, perfecto para cualquier pausa.": "Frango envolto em massa dourada e crocante, perfeito para qualquer pausa.", "Suave y refrescante, acompaña muy bien una pausa con pan o algo frito.": "Suave e refrescante, combina muito bem com pão ou um salgado.", "Una bebida tradicional, fresca y lista para acompañar tus antojos.": "Uma bebida tradicional e refrescante para acompanhar seus desejos.", "Fresco y sencillo: el compañero ideal para bajar el calor y seguir disfrutando.": "Fresco e simples: ideal para aliviar o calor e continuar aproveitando.",
  "¿Qué se te ": "O que você está ", "antoja hoy?": "com vontade de comer hoje?", "Explorar categorías": "Explorar categorias", "Pan de queso recién horneado": "Pão de queijo recém-assado", "Empanada dorada": "Empanada dourada", "Avena servida en vaso": "Bebida de aveia servida em um copo", "Panes, croissants y mojicones.": "Pães, croissants e pãezinhos doces.", "Cortezas doradas, miga suave y algo rico para compartir.": "Cascas douradas, massa macia e algo gostoso para compartilhar.", "Empanadas y pasteles.": "Empanadas e pastéis.", "Empanadas y pasteles: descubre esta parte de nuestra selección.": "Empanadas e pastéis: conheça esta parte do nosso cardápio.", "Avena, sevillana y guarapo.": "Bebida de aveia, sevillana e guarapo.", "Avena, sevillana y guarapo para acompañar tu elección.": "Bebida de aveia, sevillana e guarapo para acompanhar sua escolha.", "Acerca de ": "Sobre ", "nosotros.": "nós.", "Un lugar para encontrarnos alrededor de algo rico.": "Um lugar para nos encontrarmos em torno de algo gostoso.", "En Amankay reunimos panes, fritos y bebidas para distintos momentos del día. Nuestra sede principal está en el centro de Neiva; aquí puedes conocer lo que ofrecemos y elegir lo que más se te antoje.": "Na Amankay, reunimos pães, salgados e bebidas para diferentes momentos do dia. Nossa filial principal fica no centro de Neiva; conheça nosso cardápio e escolha o que mais desejar.", "Conoce nuestra sede": "Conheça nossa filial",
  "Así toma": "Como o pão ganha", "forma": "forma", "el pan.": ".", "Video en bucle del proceso de elaboración del pan": "Vídeo em loop do processo de fabricação do pão", "No se pudo cargar el video.": "Não foi possível carregar o vídeo.", "Abrir el clip directamente": "Abrir o vídeo diretamente", "Textura de ": "Padrão decorativo de ", "Agregar a la bolsa": "Adicionar à sacola",
  "Buen día,": "Bom dia,", "TU JORNADA EN AMANKAY": "SEU DIA NA AMANKAY", "Información actual de tu operación en ": "Informações atuais da sua operação em ", "Actualizando…": "Atualizando…", "Datos de la API": "Dados da API", "OPERACIÓN": "OPERAÇÃO", "ACCESO": "ACESSO", "Selecciona una sucursal para comenzar.": "Selecione uma filial para começar.", "Atender pedidos": "Atender pedidos", "Todo en su lugar.": "Tudo em seu lugar.", "Tu cuenta muestra las áreas de sus roles. Java vuelve a comprobar los permisos y la sucursal en cada operación.": "Sua conta mostra as áreas permitidas por seus perfis. O Java verifica novamente as permissões e a filial em cada operação.", "Gestionar mesas": "Gerenciar mesas", "Atención en este momento": "Atenção neste momento", "Por confirmar": "Aguardando confirmação", "Más de 3 minutos": "Mais de 3 minutos", "Mesas con sesión": "Mesas com sessão ativa", "Entregas en curso": "Entregas em andamento", "Inventario y reposiciones": "Estoque e reposições", "Productos con inventario": "Produtos com estoque", "Con 5 unidades o menos": "Com 5 unidades ou menos", "Reposiciones en curso": "Reposições em andamento", "El umbral de 5 unidades es una referencia visual del tablero; no cambia las reglas de inventario.": "O limite de 5 unidades é apenas uma referência visual do painel; não altera as regras de estoque.", "Mis entregas": "Minhas entregas", "Asignadas o en camino": "Atribuídas ou em trânsito", "Desde aquí podrás acceder a la configuración y los reportes autorizados para tu rol.": "Aqui você poderá acessar as configurações e os relatórios permitidos para seu perfil.", "Manos amasando la masa sobre una mesa enharinada": "Mãos sovando a massa sobre uma mesa enfarinhada", "Manos dando forma a una pieza de masa": "Mãos modelando um pedaço de massa", "Panes dorados dentro del horno": "Pães dourados dentro do forno", "Panes recién horneados listos para compartir": "Pães recém-assados prontos para compartilhar", "Este acceso temporal corresponde a otra mesa.": "Este acesso temporário pertence a outra mesa.", "No se pudo cerrar la sesión.": "Não foi possível encerrar a sessão.", "No se pudo cargar el tablero.": "Não foi possível carregar o painel.", "La sesión no está disponible.": "A sessão não está disponível."
};

/** @typedef {{locale: Locale, setLocale: (locale: Locale) => void, t: (text: string) => string, formatDate: (value: string | Date) => string, formatCurrency: (value: number, currency?: string) => string, formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string}} LocaleContextValue */
/** @type {import("react").Context<LocaleContextValue | null>} */
const LocaleContext = createContext(null);

/** @param {{children: import("react").ReactNode}} props */
export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(/** @type {Locale} */ ("es-CO"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    /** @type {string | null} */
    let saved = null;
    try {
      saved = localStorage.getItem("amankay-locale");
    } catch { /* The selected language still works for this visit when storage is blocked. */ }
    queueMicrotask(() => {
      if (saved === "en" || saved === "pt-BR" || saved === "es-CO") setLocaleState(saved);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    if (ready) {
      try { localStorage.setItem("amankay-locale", locale); }
      catch { /* The selected language still works for this visit when storage is blocked. */ }
    }
  }, [locale, ready]);
  const intlLocale = locale === "en" ? "en-US" : locale;
  const value = useMemo(() => ({
    locale,
    setLocale: (next) => setLocaleState(next),
    t: (text) => (locale === "en" ? english : locale === "pt-BR" ? portuguese : {})[text] ?? text,
    formatDate: (date) => new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeStyle: "short" }).format(date instanceof Date ? date : new Date(date)),
    formatCurrency: (amount, currency = "COP") => new Intl.NumberFormat(intlLocale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount),
    formatNumber: (number, options) => new Intl.NumberFormat(intlLocale, options).format(number),
  }), [intlLocale, locale]);
  return createElement(LocaleContext.Provider, { value }, children);
}

export function useI18n() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}

/** @param {{className?: string}} props */
export function LanguageSwitch({ className = "" } = {}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    const closeOutside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    const closeEscape = (event) => { if (event.key === "Escape") { setOpen(false); trigger.current?.blur(); } };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, []);
  const pointerHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  /** @type {{code: Locale, short: string, name: string}[]} */
  const items = [{ code: "es-CO", short: "ES", name: "Español (Colombia)" }, { code: "en", short: "EN", name: "English" }, { code: "pt-BR", short: "PT", name: "Português (Brasil)" }];
  const options = items.map(item => createElement("button", {
    key: item.code,
    className: "language-switch-option",
    type: "button",
    lang: item.code,
    "aria-label": item.name,
    "aria-pressed": locale === item.code,
    onClick: () => { setLocale(item.code); setOpen(false); }
  }, item.short));
  return createElement("div", {
    ref: root,
    className: `language-switch ${open ? "is-open" : ""} ${className}`,
    role: "group",
    "aria-label": t("Idioma"),
    onMouseEnter: () => { if (pointerHover()) setOpen(true); },
    onMouseLeave: () => { if (!root.current?.contains(document.activeElement)) setOpen(false); },
    onFocus: event => { if (event.target.matches(":focus-visible")) setOpen(true); },
    onBlur: event => { if (!root.current?.contains(event.relatedTarget)) setOpen(false); }
  },
  createElement("div", { className: "language-switch-options", id }, ...options),
  createElement("button", {
    ref: trigger,
    className: "language-switch-tab",
    type: "button",
    "aria-label": t("Idioma"),
    "aria-expanded": open,
    "aria-controls": id,
    onClick: () => { if (!pointerHover()) setOpen(value => !value); }
  }, createElement("span", { "aria-hidden": true }, items.find(item => item.code === locale)?.short ?? "ES"), createElement(ChevronDown, { size: 13, "aria-hidden": true })));
}
