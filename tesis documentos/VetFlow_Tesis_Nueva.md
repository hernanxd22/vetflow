# UNIVERSIDAD NACIONAL DEL COMAHUE

# VetFlow
## Sistema Automatizado de Gestión de Citas Veterinarias con Agente de Inteligencia Artificial y Aplicación Web

**Profesor:** Alberto Cortez

**Autores:** Hernán Farfan · Nicolás Romano

**Año 2026**

---

## Contenido

Resumen .............................................................................................................................. 4
Capítulo 1: Introducción ..................................................................................................... 4
  1.1 Presentación del tema ............................................................................................ 4
  1.2 Planteamiento del problema .................................................................................. 5
  1.3 Justificación ............................................................................................................. 6
  1.4 Objetivos ................................................................................................................. 7
    Objetivo general ...................................................................................................... 7
    Objetivos específicos ............................................................................................... 7
  1.5 Hipótesis de trabajo ............................................................................................... 7
  1.6 Alcance y limitaciones ............................................................................................ 7
Capítulo 2: Marco Teórico .................................................................................................. 8
  2.1 Automatización de procesos de negocio ............................................................... 8
  2.2 Agentes de inteligencia artificial conversacionales ................................................ 8
  2.3 Plataformas de integración de bajo código ............................................................ 9
  2.4 Aplicaciones web progresivas como interfaz de usuario ....................................... 9
  2.5 Usabilidad en sistemas de salud de baja complejidad ......................................... 10
Capítulo 3: Estado del Arte .............................................................................................. 11
  3.1 Sistemas de gestión veterinaria existentes ......................................................... 11
  3.2 Bots conversacionales en servicios de salud ....................................................... 11
  3.3 Plataformas de automatización: análisis comparativo ........................................ 12
  3.4 Canales de interacción: bots de mensajería vs. aplicaciones web ...................... 13
Capítulo 4: Marco Metodológico ...................................................................................... 14
  4.1 Enfoque y tipo de investigación ........................................................................... 14
  4.2 Diseño de la investigación ................................................................................... 14
  4.3 Unidad de análisis y participantes ....................................................................... 15
  4.4 Técnicas e instrumentos ...................................................................................... 15
    Fase de diagnóstico ............................................................................................... 15
    Fase de diseño ...................................................................................................... 16
    Fase de implementación ....................................................................................... 16
    Fase de validación funcional ................................................................................. 16
  4.5 Análisis de datos .................................................................................................. 16
  4.6 Consideraciones éticas ........................................................................................ 16
Capítulo 5: Desarrollo del Sistema .................................................................................. 17
  5.1 Arquitectura general ............................................................................................ 17
  5.2 Componentes implementados ............................................................................. 18
  5.3 Flujos principales ................................................................................................. 20
    Flujo de agendamiento ......................................................................................... 20
    Flujo de reprogramación ....................................................................................... 21
    Flujo de cancelación ............................................................................................. 22
    Flujo de consulta ................................................................................................... 22
    Flujos de saludo y despedida ............................................................................... 23
  5.4 Configuración del AI Agent .................................................................................. 23
  5.5 Entorno de despliegue ......................................................................................... 24
  5.6 Pruebas y validación ............................................................................................ 25
Capítulo 6: Resultados .................................................................................................... 26
  6.1 Validación funcional de flujos .............................................................................. 26
  6.2 Problemas encontrados y soluciones implementadas ........................................ 26
Capítulo 7: Discusión ....................................................................................................... 28
  7.1 Contraste entre hipótesis y resultados ............................................................... 28
  7.2 Contraste con la literatura .................................................................................. 28
  7.3 Limitaciones y amenazas a la validez .................................................................. 29
  7.4 Implicancias para la práctica ............................................................................... 29
Capítulo 8: Conclusiones ................................................................................................. 30
  8.1 Síntesis de aportes .............................................................................................. 30
  8.2 Trabajo futuro ...................................................................................................... 30
  8.3 Reflexión final ...................................................................................................... 31
Referencias Bibliográficas ................................................................................................ 32
Anexo A: Diagrama de Arquitectura del Sistema ............................................................ 33
Anexo B: Estructura del Workflow en n8n ....................................................................... 34
Anexo C: System Prompts de los AI Agents .................................................................... 36

---

VetFlow — Sistema Automatizado de Gestión de Citas Veterinarias | Web App + IA
Farfan & Romano · TFG 2026 · Pág. 4

## Resumen

El presente Trabajo Final de Grado describe el diseño, implementación y validación de VetFlow, un sistema automatizado de gestión de citas para clínicas veterinarias de pequeña y mediana escala. La propuesta consiste en reemplazar el proceso manual de agendamiento por un agente de inteligencia artificial accesible a través de una aplicación web con chatbot conversacional embebido, capaz de interpretar lenguaje natural para agendar, reprogramar, cancelar y consultar turnos de manera autónoma.

El sistema fue construido combinando una API REST desarrollada en FastAPI y Python, una aplicación frontend de página única (SPA) desarrollada en React con TypeScript, y la plataforma de orquestación n8n como motor de inteligencia artificial. La capa de IA utiliza AI Agents basados en LangChain, el modelo chatgpt-mini accedido vía OpenRouter y Simple Memory para mantener contexto conversacional. La persistencia de datos se implementó sobre PostgreSQL, y la creación de eventos de turno se integra con Google Calendar API.

La metodología combinó el relevamiento etnográfico previo realizado en tres clínicas veterinarias de Neuquén con un desarrollo iterativo de cuatro fases: diagnóstico, diseño, implementación y validación funcional. Durante el proceso de desarrollo se enfrentaron múltiples desafíos técnicos —desde la gestión del estado conversacional hasta la interpretación precisa de fechas en lenguaje natural— que fueron resueltos mediante una máquina de estados explícita, validaciones en múltiples capas y un diseño cuidadoso de los prompts del sistema.

El resultado es un sistema funcional que gestiona el ciclo completo de un turno veterinario a través de una interfaz web que no requiere instalación de aplicaciones adicionales por parte del usuario, operando a un costo mensual de entre USD 8 y USD 11. Si bien el sistema no fue desplegado en clínicas reales durante el período de este trabajo —limitación que se aborda explícitamente en la discusión—, la validación funcional de los cuatro flujos principales demuestra la viabilidad técnica de la solución y sienta las bases para una futura evaluación con usuarios en entornos productivos.

---

## Capítulo 1: Introducción

### 1.1 Presentación del tema

El presente trabajo aborda el diseño e implementación de un sistema de gestión automatizada de citas veterinarias basado en inteligencia artificial conversacional. El sistema, denominado VetFlow, combina una aplicación web accesible desde cualquier navegador con un agente de IA con memoria conversacional para gestionar el ciclo completo de un turno veterinario en lenguaje natural.

VetFlow surge como una evolución de una versión previa del sistema, originalmente concebida como un bot de Telegram. El cambio de arquitectura —de un bot de mensajería a una aplicación web completa con chatbot embebido— respondió a hallazgos concretos del relevamiento de campo: la barrera de adopción que representaba Telegram para una porción significativa de los usuarios. Este trabajo documenta tanto el proceso de desarrollo de la nueva versión como las decisiones arquitectónicas que la sustentan.

### 1.2 Planteamiento del problema

La transformación digital de los servicios de salud animal ha avanzado de forma profundamente desigual en Argentina. Mientras clínicas de mayor envergadura han incorporado sistemas de gestión integrados, el segmento de consultorios veterinarios independientes —que representa, según datos del Consejo Profesional de Medicina Veterinaria de la Nación (2023), más del 70% de los establecimientos habilitados en el país— permanece anclado en prácticas de gestión que combinan el teléfono, la agenda en papel y, en el mejor de los casos, hojas de cálculo no compartidas.

Esta situación genera consecuencias concretas y medibles. Durante el relevamiento de campo realizado en tres clínicas veterinarias de la ciudad de Neuquén se identificaron los siguientes problemas recurrentes: solapamiento de turnos por verificación manual de disponibilidad, ausencias no comunicadas por falta de recordatorios automáticos, pérdida de solicitudes de turno recibidas fuera del horario de atención, y una carga administrativa que consumía en promedio 9,2 horas semanales del personal de recepción —tiempo que podría destinarse a tareas de mayor valor clínico. El 30% de los turnos requerían al menos una reprogramación, proceso que en el esquema manual demandaba tanto tiempo como el agendamiento inicial.

El problema central que motiva este trabajo puede formularse en los siguientes términos: las clínicas veterinarias de pequeña escala carecen de herramientas de gestión de turnos que sean simultáneamente accesibles (bajo costo), adoptables (sin fricción para el usuario) y capaces de manejar la variabilidad inherente a la comunicación cotidiana con sus clientes.

A este diagnóstico inicial se suma un hallazgo adicional que reorientó significativamente el desarrollo del proyecto. La primera versión de VetFlow fue concebida como un bot de Telegram, partiendo del dato de que el 78% de los propietarios de mascotas encuestados afirmaban usar dicha aplicación. Sin embargo, durante las pruebas preliminares se identificó un obstáculo crítico: aquellos usuarios que no tenían Telegram instalado eran redirigidos a la tienda de aplicaciones para descargarlo, y muchos simplemente abandonaban el proceso. La frase de una de las propietarias entrevistadas —"yo tengo mascotas pero no tengo Telegram"— sintetiza la barrera que motivó el rediseño completo del canal de interacción.

Se evaluó la alternativa de migrar el bot a WhatsApp Business API, por ser la aplicación de mensajería de mayor penetración en Argentina. Esta alternativa fue descartada por tres razones: (a) la API de WhatsApp Business requiere aprobación de Meta y un número de teléfono dedicado, (b) impone restricciones de plantillas y ventanas de tiempo para mensajes proactivos, y (c) tiene un costo por mensaje en determinados modelos de uso. En contraste, una aplicación web no impone ninguna de estas barreras: el usuario simplemente ingresa una URL en su navegador habitual y comienza a interactuar.

### 1.3 Justificación

La justificación de este trabajo opera en tres dimensiones complementarias. Desde una perspectiva práctica, la brecha tecnológica identificada en el segmento de clínicas veterinarias independientes representa una oportunidad concreta de intervención con alto impacto: mejorar la eficiencia operativa de estos establecimientos redunda directamente en la calidad del servicio prestado a los propietarios de mascotas y en las condiciones de trabajo del personal. La eliminación de la barrera de instalación de aplicaciones —al migrar de Telegram a una web app— amplía significativamente el universo de usuarios potenciales.

Desde una perspectiva tecnológica, la integración de AI Agents con memoria conversacional en plataformas de automatización como n8n, expuestos a través de una API REST y consumidos por una aplicación React, representa una arquitectura moderna y replicable. Este stack tecnológico —FastAPI + React + n8n + PostgreSQL— permite separar las responsabilidades en capas bien definidas: presentación (React), lógica de negocio (FastAPI) e inteligencia conversacional (n8n), cada una escalable y mantenible de forma independiente.

Desde una perspectiva académica, la literatura sobre automatización en servicios veterinarios es notablemente escasa en el contexto latinoamericano. Este trabajo contribuye a cubrir esa brecha con una implementación real, documentada con rigor, que puede servir de referencia para trabajos futuros en dominios similares.

### 1.4 Objetivos

**Objetivo general**

Diseñar, implementar y validar funcionalmente un sistema de gestión de citas para clínicas veterinarias que, operando a través de una aplicación web con chatbot de IA embebido, automatice el ciclo completo de agendamiento, reprogramación, cancelación y consulta de turnos en lenguaje natural.

**Objetivos específicos**

1. Relevar las limitaciones de la versión previa del sistema (bot de Telegram) e identificar los requisitos para una nueva arquitectura basada en web.
2. Diseñar una arquitectura de tres capas —frontend React, backend FastAPI, orquestación de IA en n8n— que integre un AI Agent con memoria conversacional, PostgreSQL y Google Calendar.
3. Implementar el sistema completo incluyendo registro y autenticación de usuarios, gestión de mascotas, chatbot conversacional, y panel de administración para el personal veterinario.
4. Validar funcionalmente los cuatro flujos principales del sistema —agendamiento, reprogramación, cancelación y consulta— mediante pruebas de caja negra.

### 1.5 Hipótesis de trabajo

La implementación de un agente conversacional basado en inteligencia artificial, integrado con una aplicación web y Google Calendar mediante la plataforma n8n, es capaz de gestionar de forma autónoma el ciclo completo de un turno veterinario —agendamiento, reprogramación, cancelación y consulta— sin requerir software propietario ni infraestructura de servidores costosa, y con una barrera de adopción menor que las soluciones basadas en bots de mensajería.

### 1.6 Alcance y limitaciones

El sistema cubre el ciclo completo de un turno: registro y autenticación de usuarios, gestión de mascotas por cliente, solicitud conversacional de turno mediante chatbot web, interpretación de intención mediante IA, verificación de disponibilidad horaria, confirmación automática con Google Calendar, reprogramación, cancelación y consulta de turnos vigentes. Incluye además un panel de administración que permite al personal veterinario visualizar todas las citas confirmadas en un calendario semanal.

No incluye historia clínica, facturación, gestión de inventario de medicamentos, recordatorios automáticos por correo electrónico, ni notificaciones push. La validación funcional fue realizada exclusivamente por el equipo de desarrollo; no se realizaron pruebas con usuarios reales ni despliegues en clínicas veterinarias durante el período de este trabajo.

---

## Capítulo 2: Marco Teórico

### 2.1 Automatización de procesos de negocio

La automatización de procesos de negocio (Business Process Automation, BPA) refiere al uso de tecnología para ejecutar tareas recurrentes con mínima intervención humana, liberando recursos cognitivos para actividades de mayor valor (van der Aalst et al., 2003). En su formulación más amplia, la BPA es un subconjunto de la gestión de procesos de negocio (BPM), disciplina que combina modelado, análisis, mejora y automatización de flujos organizacionales (Dumas et al., 2018).

Sommerville (2016) distingue entre automatización de tareas discretas y automatización de flujos complejos, en los que múltiples tareas interdependientes son orquestadas según condiciones predefinidas. VetFlow opera en este segundo nivel: gestiona un ciclo completo de acciones condicionadas al estado del calendario, a la respuesta conversacional del usuario y a reglas de negocio configurables.

En el contexto de aplicaciones web modernas, la automatización de procesos de negocio se beneficia de arquitecturas distribuidas donde cada componente asume una responsabilidad específica. La separación entre la capa de presentación (frontend), la capa de lógica de negocio (backend API) y la capa de orquestación inteligente (n8n) sigue el principio de separación de responsabilidades (Separation of Concerns) formulado por Dijkstra (1974) y aplicado extensamente en la arquitectura de software contemporánea.

### 2.2 Agentes de inteligencia artificial conversacionales

Un agente de IA es un sistema capaz de percibir su entorno, razonar sobre él y ejecutar acciones para alcanzar objetivos definidos (Russell & Norvig, 2020). En el contexto de los Large Language Models (LLMs), los AI Agents extienden la capacidad de generación de texto con la posibilidad de invocar herramientas externas (tool use), mantener estado conversacional (memoria) y ejecutar secuencias de razonamiento encadenado (chain-of-thought).

El framework LangChain (Chase, 2022) estandarizó la composición de agentes LLM con herramientas y memorias; n8n incorpora esta abstracción de manera nativa desde su versión 1.x, permitiendo construir agentes sin escribir código Python. En VetFlow, el modelo de lenguaje utilizado es chatgpt-mini, accedido a través de OpenRouter, una capa de intermediación que permite utilizar modelos de múltiples proveedores a través de una única API. La elección de OpenRouter como proxy respondió a una limitación práctica: la imposibilidad de adquirir créditos directamente de OpenAI por restricciones en los medios de pago disponibles. OpenRouter resolvió este obstáculo manteniendo el acceso al mismo modelo de lenguaje.

La memoria conversacional es crítica en sistemas de agendamiento: el agente debe recordar el nombre del cliente, la mascota, la fecha propuesta y los horarios rechazados dentro de una misma sesión. Simple Memory, el módulo utilizado en VetFlow, implementa un buffer de contexto por sesión que persiste durante la conversación activa y se descarta al cerrarla, ofreciendo el balance adecuado entre continuidad conversacional y privacidad de datos.

No obstante, la implementación reveló que Simple Memory por sí sola no era suficiente para mantener el estado en flujos complejos de múltiples pasos como el agendamiento o la reprogramación. Para resolver esta limitación, VetFlow implementa una máquina de estados explícita a nivel de base de datos (columna `estado` en la tabla `citas`), donde cada paso del flujo conversacional actualiza el estado de la cita (`agendando` → `espagenda` → `confirmado`, y análogos para reprogramación y cancelación). Esta decisión de diseño —combinar memoria conversacional del agente con estado transaccional en base de datos— resultó ser uno de los hallazgos técnicos más relevantes del proyecto.

### 2.3 Plataformas de integración de bajo código

Las plataformas de integración de bajo código (Low-Code Integration Platforms) han democratizado el acceso a la automatización de flujos en la última década, permitiendo conectar servicios mediante interfaces gráficas o configuraciones declarativas con mínima programación convencional (Richardson & Kulkarni, 2021). Según el patrón Message Broker de Hohpe & Woolf (2003), estas plataformas actúan como intermediarios que reciben eventos de sistemas origen, los transforman y enrutan hacia sistemas destino.

n8n se distingue en este ecosistema por combinar capacidades de integración con soporte nativo de AI Agents basados en LangChain, siendo la única plataforma open-source que permite construir flujos con razonamiento en lenguaje natural sin depender de servicios externos de orquestación.

En la arquitectura de VetFlow, n8n no actúa como sistema independiente sino como un servicio especializado dentro de una arquitectura más amplia. La aplicación React envía los mensajes del usuario al backend FastAPI, que a su vez los reenvía a un webhook de n8n. n8n procesa el mensaje —clasificando la intención, consultando PostgreSQL, interactuando con Google Calendar— y devuelve una respuesta HTTP que el backend retransmite al frontend. Este diseño mantiene a n8n como el motor de IA pero lo integra como un componente más de la arquitectura global.

### 2.4 Aplicaciones web progresivas como interfaz de usuario

Una aplicación de página única (Single Page Application, SPA) es una aplicación web que se ejecuta completamente en el navegador del cliente, actualizando dinámicamente el contenido sin recargar la página completa (Flanagan, 2020). React, la biblioteca utilizada en VetFlow, implementa un modelo de componentes reutilizables con un DOM virtual que optimiza las actualizaciones de la interfaz.

La elección de una SPA como interfaz de VetFlow responde a una decisión de accesibilidad. A diferencia de los bots de mensajería —que requieren que el usuario tenga instalada una aplicación específica (Telegram, WhatsApp) y una cuenta activa en esa plataforma—, una aplicación web es accesible desde cualquier navegador en cualquier dispositivo con conexión a Internet, sin instalación previa.

Esta diferencia es conceptualmente significativa. Nielsen (1994) establece como primera heurística de usabilidad la "visibilidad del estado del sistema", pero una heurística implícita aún más fundamental es la "accesibilidad del sistema": si el usuario no puede llegar al sistema, ninguna otra heurística importa. Vest & Gamm (2010) señalan que la adopción tecnológica en entornos clínicos de pequeña escala está fuertemente condicionada por la simplicidad percibida. Una URL que se abre en el navegador habitual del usuario —el mismo que usa para buscar información, leer noticias o acceder a redes sociales— representa el mínimo de fricción posible en el acceso.

Adicionalmente, una aplicación web permite integrar funcionalidades complementarias que un bot de mensajería no podría ofrecer con la misma fluidez: registro de usuarios con formularios validados, gestión visual de mascotas con edición inline, tablero de administración con calendario semanal, y —fundamentalmente— un chatbot embebido que está siempre disponible en la misma interfaz donde el usuario gestiona el resto de sus interacciones con la clínica.

### 2.5 Usabilidad en sistemas de salud de baja complejidad

Nielsen (1994) propone diez heurísticas de usabilidad entre las que destacan la visibilidad del estado del sistema, el control y libertad del usuario, y la prevención de errores. Vest & Gamm (2010) señalan que la adopción tecnológica en entornos clínicos de pequeña escala está fuertemente condicionada por la simplicidad percibida: si el sistema introduce fricción en el flujo habitual de trabajo, el personal tiende a abandonarlo.

La conversación en lenguaje natural como interfaz reduce la barrera de adopción al aprovechar una habilidad que el usuario ya posee, sin requerir capacitación formal ni instalación de nuevas aplicaciones. La combinación de esta interfaz conversacional con una aplicación web tradicional —donde el usuario puede alternar entre el chat y las vistas estructuradas de sus mascotas y citas— ofrece un modelo híbrido que maximiza tanto la accesibilidad como la funcionalidad.

La System Usability Scale (SUS), desarrollada por Brooke (1996) y validada por Bangor et al. (2008), es un instrumento de diez ítems que mide usabilidad percibida con alta confiabilidad y sin expertise técnico por parte de los evaluados. Si bien este instrumento no fue aplicado en el presente trabajo —dado que no se realizaron pruebas con usuarios reales—, se incluye como referencia metodológica para la fase de evaluación que constituye el trabajo futuro inmediato del proyecto.

---

## Capítulo 3: Estado del Arte

### 3.1 Sistemas de gestión veterinaria existentes

El mercado de software de gestión veterinaria ofrece soluciones maduras orientadas principalmente a establecimientos de mediana y gran escala. VetPraxis, eVetPractice y Provet Cloud integran módulos de agendamiento, historia clínica, facturación y control de inventario bajo arquitecturas monolíticas accesibles mediante suscripción mensual. Sus costos —que oscilan entre USD 80 y USD 400 mensuales— y su curva de implementación, que típicamente requiere capacitación formal y migración de datos, los posicionan fuera del alcance de la mayoría de las clínicas unipersonales que constituyen el perfil objetivo de este trabajo.

Existen también aplicaciones de gestión de turnos de propósito general —Calendly, SimplyBook.me, Acuity Scheduling— que pueden adaptarse parcialmente al caso veterinario. Sin embargo, estas plataformas no contemplan las particularidades del dominio (múltiples mascotas por propietario, tipos de consulta diferenciados por especie) y su modelo SaaS implica dependencia de proveedores externos con control limitado sobre los datos generados.

Ninguno de estos sistemas ofrece una interfaz conversacional en lenguaje natural ni una arquitectura que combine una API REST propia con un motor de IA externo, características que distinguen a VetFlow de las alternativas comerciales existentes.

### 3.2 Bots conversacionales en servicios de salud

La literatura académica reciente documenta una proliferación de bots conversacionales en servicios de salud humana, que van desde el triaje sintomático (Palanica et al., 2019) hasta la gestión de turnos en consultorios odontológicos (Herrera & Pinto, 2021) y centros de atención primaria (Gómez et al., 2022). Estos trabajos reportan consistentemente mejoras en tasas de presentación, reducción de tiempos de espera y mayor satisfacción, particularmente en poblaciones que ya utilizan aplicaciones de mensajería cotidianamente.

Herrera & Pinto (2021) reportan una reducción del 38% en llamadas de agendamiento para un bot odontológico basado en reglas sobre WhatsApp. Gómez et al. (2022) documentan mejoras de entre 15 y 25 puntos porcentuales en tasas de confirmación de turnos en centros de atención primaria. Ambos trabajos utilizan exclusivamente bots de mensajería como canal, sin explorar la alternativa de una aplicación web con chatbot embebido.

En el dominio veterinario específico, la literatura es considerablemente más escasa. Se identificaron dos trabajos exploratorios que señalan la viabilidad del enfoque conversacional pero no reportan implementaciones en producción con evaluación cuantitativa sistemática.

La incorporación de LLMs como motor de los bots conversacionales representa el avance más significativo de los últimos tres años en este campo. A diferencia de los bots basados en reglas o árboles de decisión, los bots potenciados por LLMs manejan variaciones en la formulación del usuario, se recuperan de malentendidos y adaptan su respuesta al contexto acumulado, lo que los hace significativamente más robustos para uso cotidiano sin entrenamiento técnico (Brown et al., 2020).

### 3.3 Plataformas de automatización: análisis comparativo

La selección de n8n como plataforma central de VetFlow fue el resultado de una comparativa sistemática frente a las alternativas más utilizadas en el ecosistema de automatización. Los criterios considerados fueron: modelo de licenciamiento, posibilidad de autoalojamiento, costo operativo, soporte nativo de AI Agents con memoria conversacional, y disponibilidad de integración con bases de datos y APIs externas. La tabla siguiente sintetiza los resultados.

| Criterio | Zapier | Make | n8n |
|---|---|---|---|
| Licencia | SaaS Pago | SaaS / Freemium | Open Source |
| Autoalojamiento | No | No | Sí |
| Costo mensual | $20–$600 | $9–$300 | $0 (self-hosted) |
| Nodos personalizados | Limitado | Limitado | Total (JS/Python) |
| IA nativa (Agents) | No | No | Sí (LangChain) |
| Memoria conversacional | No | No | Sí (Simple Memory) |
| Control de datos | Nube proveedor | Nube proveedor | Servidor propio |
| Conexión PostgreSQL | No (solo vía API) | Limitado | Sí (nodo nativo) |

n8n es la única plataforma que reúne soporte nativo de AI Agents con LangChain, memoria conversacional integrada, autoalojamiento gratuito, nodo PostgreSQL nativo y capacidad de exponer webhooks HTTP. Esta combinación resulta decisiva para VetFlow: sin AI Agents el sistema no podría interpretar lenguaje natural; sin memoria cada mensaje sería procesado sin contexto; sin el nodo PostgreSQL el sistema no podría implementar la máquina de estados que resultó esencial para la estabilidad conversacional; sin webhooks HTTP no sería posible integrar n8n como un servicio dentro de la arquitectura FastAPI + React. La ventaja de n8n no reside en ninguno de estos factores de manera aislada, sino en su coexistencia en una única plataforma open-source.

### 3.4 Canales de interacción: bots de mensajería vs. aplicaciones web

La elección del canal de interacción con el usuario es una decisión arquitectónica de primer orden en sistemas conversacionales. La literatura reciente ofrece dos grandes enfoques: los bots integrados en plataformas de mensajería existentes (Telegram, WhatsApp, Facebook Messenger) y las aplicaciones web propias con chatbot embebido.

Los bots de mensajería ofrecen ventajas de implementación: el usuario ya conoce la interfaz, la notificación es nativa y el desarrollo inicial es más rápido. Sin embargo, presentan desventajas significativas de adopción: el usuario debe tener instalada la aplicación y una cuenta activa; la plataforma (Telegram, Meta) actúa como intermediario obligado; y las capacidades de la interfaz están limitadas a lo que la API de mensajería del proveedor permite. En el caso de WhatsApp Business API, se suman restricciones de plantillas, costos por mensaje y un proceso de aprobación que puede demorar semanas.

Las aplicaciones web propias eliminan estas dependencias: el usuario accede desde cualquier navegador sin instalar nada; el desarrollador tiene control total sobre la interfaz; y pueden integrarse funcionalidades complementarias (paneles de administración, gestión de perfiles, visualización de datos) que serían imposibles o muy limitadas en un bot de mensajería. La desventaja principal es que la aplicación no es "descubrible" desde la plataforma de mensajería que el usuario ya usa; debe ser promovida activamente por la clínica.

El caso de VetFlow es particularmente ilustrativo de esta tensión. La versión original del sistema era un bot de Telegram, elección motivada por el dato inicial de que el 78% de los encuestados usaban esa aplicación. Sin embargo, la experiencia de campo reveló que "usar Telegram" y "querer gestionar turnos veterinarios por Telegram" son conductas diferentes, y que la barrera de instalación para el porcentaje de usuarios que no tenían la aplicación era lo suficientemente alta como para justificar un cambio completo de arquitectura.

---

## Capítulo 4: Marco Metodológico

### 4.1 Enfoque y tipo de investigación

Este trabajo se enmarca en un enfoque mixto que combina componentes cualitativos y cuantitativos. La fase de diagnóstico adoptó una perspectiva cualitativa —centrada en la comprensión de las limitaciones de la versión previa del sistema y la identificación de requisitos para la nueva arquitectura— mientras que la fase de validación incorporó pruebas funcionales sistemáticas sobre los flujos implementados.

En términos del propósito de la investigación, el trabajo es de naturaleza aplicada: su objetivo no es construir teoría sino resolver un problema práctico concreto con rigor metodológico suficiente para validar la solución propuesta y documentar las decisiones arquitectónicas que la sustentan.

### 4.2 Diseño de la investigación

El diseño global del trabajo siguió un modelo de desarrollo iterativo en cuatro fases secuenciales, detalladas en la tabla siguiente.

| Fase | Actividad | Técnica | Duración |
|---|---|---|---|
| 1. Diagnóstico | Relevamiento de limitaciones de la versión Telegram y definición de requisitos | Análisis de la experiencia previa + revisión de arquitectura | 2 semanas |
| 2. Diseño | Modelado de la nueva arquitectura de tres capas | Diagramas de arquitectura, modelado de datos, prototipado de flujos | 2 semanas |
| 3. Implementación | Construcción del sistema completo | Desarrollo iterativo (ciclos construir-probar-corregir) | 8 semanas |
| 4. Validación | Pruebas funcionales de los flujos principales | Pruebas de caja negra sobre cada flujo conversacional | 2 semanas |

La fase de implementación adoptó un ciclo iterativo característico del desarrollo ágil: cada componente era implementado, probado mediante interacción directa con el chatbot, y corregido en función de los errores detectados. Este enfoque permitió identificar y resolver problemas de estado conversacional, interpretación de fechas y validación de reglas de negocio que habrían sido difíciles de anticipar en una fase de diseño puramente especulativa.

Es importante señalar que el desarrollo fue realizado por un equipo de dos personas que simultáneamente cursaban otras materias de la carrera, lo que resultó en una dedicación variable —típicamente entre 30 minutos y 3 horas diarias— distribuida a lo largo de aproximadamente dos meses. Esta restricción de recursos es relevante para contextualizar tanto los logros como las limitaciones del trabajo.

### 4.3 Unidad de análisis y participantes

La unidad de análisis principal es el sistema VetFlow en sí mismo como artefacto de software. A diferencia de la versión previa del proyecto —que incluyó un relevamiento etnográfico en tres clínicas veterinarias de Neuquén—, el presente trabajo se centra en la construcción y validación técnica del sistema, sin incluir una fase de evaluación con usuarios reales.

Los participantes en el proceso fueron exclusivamente los dos autores del trabajo, quienes actuaron simultáneamente como desarrolladores, testers y evaluadores del sistema. Esta limitación metodológica —la ausencia de validación externa— se aborda explícitamente en la discusión de resultados y se plantea como la principal línea de trabajo futuro.

### 4.4 Técnicas e instrumentos

**Fase de diagnóstico**

El diagnóstico se basó en el análisis de la experiencia acumulada con la versión previa del sistema (bot de Telegram). Se identificaron las siguientes limitaciones que orientaron el rediseño:

- Barrera de adopción: usuarios sin Telegram no podían acceder al sistema.
- Interfaz limitada: imposibilidad de ofrecer paneles de administración, gestión de mascotas o visualización de citas fuera del chat.
- Dependencia de la plataforma: cualquier cambio en la API de Telegram podía afectar el funcionamiento.
- Dificultad para integrar funcionalidades complementarias (registro de usuarios, perfiles, dashboards).

A partir de este diagnóstico se definieron los requisitos para la nueva arquitectura, priorizando la accesibilidad universal (cualquier navegador), la autenticación de usuarios, y la separación en capas que permitiera evolucionar cada componente de forma independiente.

**Fase de diseño**

El diseño de la arquitectura se documentó mediante diagramas de alto nivel que muestran la interacción entre los tres componentes principales: frontend React, backend FastAPI y motor de IA en n8n. El modelo de datos se definió para PostgreSQL con tres entidades principales —clientes, mascotas y citas— y se diseñó la máquina de estados que gobierna los flujos conversacionales.

**Fase de implementación**

La implementación se organizó en tres frentes de trabajo paralelos:

1. **Backend (FastAPI)**: desarrollo de la API REST con cuatro módulos —autenticación, mascotas, citas y chat—, implementando el patrón Unit of Work y Repository para el acceso a datos.
2. **Frontend (React)**: desarrollo de la SPA con tres páginas —login, registro e inicio— y un componente de chatbot embebido que se comunica con el backend.
3. **n8n**: configuración del workflow con AI Agents, nodos PostgreSQL, Google Calendar y webhooks de entrada/salida.

**Fase de validación funcional**

La validación se realizó mediante pruebas de caja negra sobre cada uno de los cuatro flujos principales: agendamiento, reprogramación, cancelación y consulta. Cada flujo fue probado enviando mensajes al chatbot en lenguaje natural y verificando que la respuesta del sistema fuera correcta y que el estado en la base de datos y en Google Calendar reflejara la operación esperada.

### 4.5 Análisis de datos

Dado que no se realizaron pruebas con usuarios reales, el análisis de datos se centró en la inspección de logs, la verificación del estado en la base de datos PostgreSQL después de cada operación, y la evaluación cualitativa de la coherencia de las respuestas del agente conversacional. Los errores detectados durante las pruebas fueron documentados, analizados y corregidos en ciclos iterativos.

### 4.6 Consideraciones éticas

Si bien el presente trabajo no involucró la recopilación de datos de usuarios reales, el diseño del sistema contempla las disposiciones de la Ley 25.326 de Protección de los Datos Personales. Los datos de autenticación (usuarios y contraseñas) son almacenados con hash bcrypt, y no se persisten tokens ni sesiones en el cliente más allá del almacenamiento en sessionStorage del navegador, que se destruye al cerrar la pestaña.

---

## Capítulo 5: Desarrollo del Sistema

### 5.1 Arquitectura general

La arquitectura de VetFlow se organiza en tres capas funcionales que se comunican a través de APIs HTTP.

**Capa de presentación (Frontend)**

Desarrollada en React 19 con TypeScript y Vite como bundler, la capa de presentación es una SPA que ofrece tres rutas principales: `/login`, `/registro` y `/inicio`. La ruta `/inicio` actúa como dashboard principal e implementa un sistema de vistas internas —sin recarga de página— que incluyen: pantalla de bienvenida, registro de mascota, listado de mascotas con edición inline, chat de turnos con el agente de IA, listado de citas personales, y panel de administración con calendario semanal.

La comunicación con el backend se realiza mediante fetch a la API REST alojada en el mismo dominio. El estado de autenticación se mantiene en sessionStorage del navegador.

**Capa de lógica de negocio (Backend)**

Desarrollada en Python 3.11 con FastAPI, la capa de negocio expone una API REST con los siguientes endpoints:

| Módulo | Rutas | Descripción |
|---|---|---|
| Auth | `POST /api/registro`, `POST /api/login` | Registro y login con bcrypt |
| Mascotas | `GET/POST /api/mascotas`, `PATCH/DELETE /api/mascotas/{id}` | CRUD de mascotas por cliente |
| Citas | `GET /api/citas/?cliente_id=`, `GET /api/citas/admin` | Listado de citas por cliente o todas (admin) |
| Chat | `POST /api/chat` | Proxy que reenvía el mensaje al webhook de n8n |

El backend implementa el patrón Unit of Work para garantizar atomicidad transaccional, y el patrón Repository para abstraer el acceso a datos con SQLAlchemy ORM sobre PostgreSQL.

**Capa de inteligencia conversacional (n8n)**

El motor de IA reside en un workflow de n8n autoalojado en Docker. Este workflow expone un webhook HTTP que recibe las solicitudes del backend FastAPI. El flujo de procesamiento es el siguiente:

1. **Webhook**: recibe `{ cliente_id, mensaje }` desde el backend.
2. **If "salir"**: detecta si el usuario quiere abandonar el flujo actual.
3. **AI Agent clasificador**: potenciado por chatgpt-mini vía OpenRouter y Simple Memory, clasifica la intención del mensaje en una de seis categorías: `agendar`, `reprogramar`, `cancelar`, `consultar`, `saludo`, `despedida` o `desconocido`. La respuesta se emite en JSON estructurado con las entidades extraídas (fecha, hora, título, event_id).
4. **Nodo Code "de texto a json"**: parsea y limpia la respuesta del AI Agent.
5. **Switch "determina estado"**: enruta el flujo hacia el sub-flujo correspondiente según la intención clasificada.
6. **Sub-flujo específico**: cada acción tiene su propia secuencia de nodos que interactúan con PostgreSQL y Google Calendar.
7. **Respond to Webhook**: cada rama devuelve una respuesta JSON con el campo `respuesta` que se propaga hasta el frontend.

A este flujo principal se suma un segundo Switch, anterior en la cadena, que evalúa el `estado` actual de la cita del cliente en la base de datos. Esto permite que, si el usuario está en medio de un agendamiento (`estado: "agendando"` o `"espagenda"`), el mensaje se enrute directamente al sub-flujo correspondiente sin pasar nuevamente por la clasificación de intención. Este diseño de doble enrutamiento —por estado actual y por intención— fue la solución al problema de pérdida de contexto conversacional.

**Diagrama de arquitectura**

```
[Usuario] → Navegador → React SPA
                            ↓ fetch HTTP
                     [FastAPI Backend]
                      /    |    |    \
                   Auth  Mascotas  Citas  Chat
                     \    |    |    /    ↓ POST /api/chat
                      [PostgreSQL]    [n8n Webhook]
                                           ↓
                              [AI Agent (OpenRouter)]
                              [chatgpt-mini + Simple Memory]
                                           ↓
                              [Switch: clasifica intención]
                              ↙    ↓    ↓    ↓    ↓    ↘
                        agendar consultar reprogramar cancelar saludo despedida
                           ↓       ↓        ↓        ↓
                      [n8n PostgreSQL nodes] ← → [PostgreSQL]
                           ↓
                      [Google Calendar API]
```

### 5.2 Componentes implementados

La tabla siguiente describe todos los componentes del sistema, su tecnología y función específica.

| Capa | Componente | Tecnología | Función |
|---|---|---|---|
| Frontend | Aplicación SPA | React 19 + TypeScript + Vite | Interfaz de usuario completa con 3 páginas y dashboard multi-vista |
| Frontend | Ruteo | React Router DOM v7 | Navegación entre login, registro y dashboard |
| Frontend | Chatbot embebido | React (componente ChatWidget) | Interfaz conversacional para agendar, reprogramar, cancelar y consultar turnos |
| Frontend | Panel admin | React (vista Admin) | Calendario semanal con todas las citas confirmadas de todos los clientes |
| Backend | Servidor API | FastAPI 0.115 + Python 3.11 | Exposición de endpoints REST |
| Backend | CORS | CORSMiddleware | Permite solicitudes desde cualquier origen |
| Backend | ORM | SQLAlchemy 2.0 | Mapeo objeto-relacional para PostgreSQL |
| Backend | Hashing | passlib + bcrypt 4.0 | Hash seguro de contraseñas |
| Backend | Validación | Pydantic 2.9 | Schemas de validación para requests y responses |
| Backend | Unit of Work | Patrón UoW (custom) | Transacciones atómicas con commit/rollback |
| Backend | Repository | Patrón Repository (custom) | Abstracción de acceso a datos para mascotas y clientes |
| BD | PostgreSQL | Tablas: clientes, mascotas, citas | Persistencia de usuarios, mascotas y turnos |
| BD | Tabla clientes | id, nombre, apellido, dni, telefono, username, password, rol, created_at | Datos de usuarios registrados |
| BD | Tabla mascotas | id, cliente_id (FK), nombre, especie, raza, fecha_nacimiento, peso, notas_medicas, created_at | Mascotas asociadas a cada cliente |
| BD | Tabla citas | id, cliente_id, mascota_id, fecha, hora, servicio, estado, notas, calendar_event_id, created_at | Turnos con máquina de estados |
| Orquestación | n8n | v1.x autoalojado en Docker | Motor de IA conversacional + integraciones |
| Trigger | Webhook | n8n Webhook node (POST) | Recibe mensajes desde el backend FastAPI |
| IA | AI Agent clasificador | LangChain Agent (n8n) + OpenRouter chatgpt-mini | Clasifica intención del mensaje y extrae entidades |
| IA | AI Agent extractor | LangChain Agent (n8n) + OpenRouter chatgpt-mini | Extrae fecha y hora del mensaje del usuario |
| IA | Memoria | Simple Memory (Buffer Window, n8n) | Persiste contexto conversacional por sesión |
| IA | Modelo | chatgpt-mini vía OpenRouter | Motor de lenguaje de los AI Agents |
| Código | Transformaciones | Code in JavaScript (n8n) | Parseo de JSON, validación de horarios, formateo de respuestas, construcción de mapeos |
| BD | Operaciones BD | PostgreSQL nodes (n8n) | Inserciones, consultas y actualizaciones sobre PostgreSQL |
| Calendario | Creación de eventos | Google Calendar node (n8n) | Crea eventos en Google Calendar al confirmar turnos |
| Deploy | VPS | Easypanel + Docker | Despliegue del backend y n8n |
| Deploy | Frontend | Vite build (estático) | Servido desde el mismo VPS |

### 5.3 Flujos principales

**Flujo de agendamiento**

El agendamiento es el flujo más complejo del sistema. Opera en cuatro pasos secuenciales, cada uno representado por un estado en la tabla `citas`:

1. **Inicio (`estado: "agendando"`)**: El AI Agent clasificador detecta la intención `agendar`. El Switch evalúa el estado actual de las citas del cliente. Si no hay una cita en estado `agendando`, se inserta una nueva fila con `estado: "agendando"`, `cliente_id` del usuario y el resto de los campos en null. El sistema consulta la tabla `mascotas` filtrando por `cliente_id`, construye una lista numerada y responde: "¿Para qué mascota querés agendar?\n1- Rex (perro)\n2- Luna (gato)".

2. **Selección de mascota (`estado: "espagenda"`)**: El usuario responde con un número (ej. "1"). Un nodo Code in JavaScript recupera la fila `agendando`, extrae el mapeo de `notas` (JSON), valida que la opción exista, y actualiza la fila: `mascota_id` con el ID correspondiente y `estado: "espagenda"`. El sistema responde: "Perfecto! ¿Para qué fecha y hora querés el turno?".

3. **Fecha y hora**: El usuario proporciona una fecha y hora en lenguaje natural ("mañana a las 10", "el lunes a las 18"). Un segundo AI Agent, especializado en extracción de entidades temporales, recibe el mensaje junto con la fecha actual como contexto y extrae `fecha` y `hora` en formato estructurado. Un nodo Code in JavaScript realiza tres validaciones:
   - **Completitud**: verifica que fecha y hora estén presentes.
   - **Día hábil**: la fecha no puede ser sábado ni domingo.
   - **Horario de atención**: la hora debe estar entre 8:00-13:00 (turno mañana) o 17:00-21:00 (turno tarde).

4. **Verificación de disponibilidad y confirmación**: Si la fecha y hora son válidas, un nodo PostgreSQL consulta si existe otra cita con el mismo `fecha`, `hora` y `estado: "confirmado"`. Si existe conflicto, el sistema responde: "Lo siento, ese horario ya está ocupado. Por favor elegí otro horario!". Si está libre, n8n crea un evento en Google Calendar en el horario solicitado y actualiza la fila en PostgreSQL: `fecha`, `hora` y `estado: "confirmado"`. El sistema responde: "Cita creada EXITOSAMENTE".

En cualquier punto de este flujo, si el usuario envía un mensaje no relacionado —por ejemplo, "hola" en lugar de un número de mascota—, el sistema se mantiene en el estado actual. Si el usuario escribe "salir", el flujo se abandona y la fila permanece con el estado que tuviera hasta el momento, sin confirmarse.

**Flujo de reprogramación**

La reprogramación sigue una estructura similar al agendamiento pero con pasos adicionales para identificar la cita a modificar:

1. **Inicio (`estado: "reprogramando"`)**: El AI Agent clasifica la intención `reprogramar`. Se inserta una fila con `estado: "reprogramando"`. El sistema lista las mascotas del cliente y pregunta: "¿Para qué mascota querés reprogramar?".

2. **Selección de mascota (`estado: "espreprogramar"`)**: El usuario elige un número. Se actualiza `mascota_id` y `estado: "espreprogramar"`.

3. **Selección de cita (`estado: "reprofeho"`)**: El sistema consulta las citas futuras confirmadas (`estado: "confirmado"` y fecha/hora posteriores al momento actual) de la mascota seleccionada. Construye una lista numerada y pregunta: "¿Cuál cita querés reprogramar?". El usuario elige un número. Se actualiza `estado: "reprofeho"` y se guarda en `notas` un JSON con el mapeo (`{"1": id_cita_elegida}`).

4. **Nueva fecha y hora**: El sistema pregunta la nueva fecha y hora. El usuario responde en lenguaje natural. El AI Agent extractor obtiene los datos, y el nodo Code in JavaScript valida día hábil, horario y disponibilidad.

5. **Confirmación**: Si todo es válido, se actualiza la cita: nuevas `fecha` y `hora`, `estado: "confirmado"`. Se crea un nuevo evento en Google Calendar. El sistema responde: "Cita reprogramada EXITOSAMENTE".

Un desafío particular de este flujo fue garantizar que la cita correcta fuera la modificada. La solución implementada utiliza un mapeo temporal guardado en el campo `notas` como JSON: el sistema asigna números a las citas mostradas al usuario y guarda la correspondencia número-ID. Cuando el usuario responde con un número, el sistema recupera el mapeo y obtiene el ID real.

**Flujo de cancelación**

El flujo de cancelación sigue la misma lógica de identificación que la reprogramación pero con un paso final de eliminación:

1. **Inicio (`estado: "cancelando"`)**: Se inserta una fila con `estado: "cancelando"`. El sistema lista las mascotas.
2. **Selección de mascota (`estado: "cancefeho"`)**: El usuario elige el número.
3. **Selección de cita**: El sistema consulta las citas confirmadas de la mascota y pregunta cuál cancelar.
4. **Cancelación**: Al recibir la confirmación del usuario, n8n elimina el evento de Google Calendar y la fila en PostgreSQL. El sistema responde: "Cita cancelada correctamente".

**Flujo de consulta**

El flujo de consulta es el más simple. Cuando el AI Agent clasifica la intención como `consultar`, n8n ejecuta una consulta SQL con JOIN entre `citas` y `mascotas`:

```sql
SELECT c.id, c.fecha, c.hora, c.estado, COALESCE(m.nombre, 'Sin mascota') as mascota
FROM citas c
LEFT JOIN mascotas m ON c.mascota_id = m.id
WHERE c.cliente_id = :cliente_id
AND c.estado = 'confirmado'
AND c.fecha IS NOT NULL
AND (c.fecha::date > CURRENT_DATE
     OR (c.fecha::date = CURRENT_DATE AND c.hora >= CURRENT_TIME AT TIME ZONE 'America/Argentina/Buenos_Aires'))
ORDER BY c.fecha ASC, c.hora ASC
```

Los resultados se formatean como una lista legible: "• Rex: 2026-06-25 a las 10:00hs\n• Luna: 2026-07-01 a las 18:00hs".

**Flujos de saludo y despedida**

Cuando el AI Agent clasifica la intención como `saludo`, el sistema responde con un mensaje cordial predefinido. Análogamente, la intención `despedida` recibe una despedida. Si la intención es `desconocido` —mensajes cortos sin sentido como "ok", "si", "no", o números sueltos—, el sistema no responde con error sino que espera el siguiente mensaje, evitando romper el flujo conversacional.

### 5.4 Configuración del AI Agent

El sistema utiliza dos AI Agents especializados, cada uno con su propio system prompt.

**AI Agent clasificador**

Su función es clasificar la intención general del mensaje y extraer las entidades relevantes. El system prompt define:

- **Rol**: asistente que SOLO clasifica intenciones.
- **Formato de salida**: JSON válido, sin texto extra.
- **Acciones posibles**: `agendar`, `reprogramar`, `cancelar`, `consultar`, `saludo`, `despedida`, `desconocido`.
- **Entidades a extraer**: `fecha`, `hora`, `titulo`, `event_id`.
- **Reglas estrictas**:
  - No inventar datos.
  - Mensajes cortos sin sentido ("ok", "si", "no") = `desconocido`.
  - Palabras de agradecimiento o despedida ("gracias", "chau") = `despedida`.
  - Un número suelto sin contexto = `desconocido`.
  - Fecha u hora sin contexto = `desconocido`.
  - El mensaje es una respuesta a una pregunta anterior = `desconocido` (el Switch de estado se encarga de enrutarlo).

**AI Agent extractor de fechas**

Su función es extraer fecha y hora de un mensaje donde el usuario está proporcionando estos datos. El system prompt incluye:

- **Contexto temporal**: la fecha actual se inyecta dinámicamente mediante `$now.setZone('America/Argentina/Buenos_Aires')`.
- **Formato de salida**: JSON con `fecha` (YYYY-MM-DD), `hora` (HH:MM), `completo` (booleano) y `mensaje_falta` (texto si falta algo).
- **Reglas**: interpretar fechas relativas ("mañana", "el lunes", "pasado mañana") usando como referencia la fecha actual inyectada.

Ambos agentes utilizan **Simple Memory** con una clave de sesión configurada como `sessionKey: "={{ $('Webhook').item.json.body.mensaje }}"`, aunque en la práctica la persistencia del estado conversacional depende más de la máquina de estados en PostgreSQL que de la memoria del agente.

El modelo de lenguaje utilizado es **chatgpt-mini** accedido a través de **OpenRouter**. La elección de OpenRouter como intermediario —en lugar de la API directa de OpenAI— respondió a una limitación operativa: los medios de pago disponibles no fueron aceptados por OpenAI. OpenRouter actuó como proxy, permitiendo acceder al mismo modelo sin modificar la lógica de los agentes.

### 5.5 Entorno de despliegue

El sistema fue desplegado en un VPS gestionado mediante Easypanel, una plataforma de administración de servidores con soporte para Docker. El entorno de producción incluye:

- **Backend FastAPI**: contenedor Docker construido a partir del `Dockerfile` del proyecto, expuesto en el puerto 8000 y servido con Uvicorn.
- **n8n**: contenedor Docker autoalojado con persistencia en volumen montado, expuesto mediante Nginx con certificado SSL de Let's Encrypt.
- **PostgreSQL**: base de datos gestionada por el proveedor del VPS.
- **Frontend React**: archivos estáticos generados con `vite build`, servidos desde el mismo VPS.

El costo operativo mensual osciló entre ARS 7.500 y ARS 9.800 (aproximadamente USD 8 a USD 11) dependiendo del mes, lo que posiciona al sistema dentro del rango de viabilidad económica para clínicas de pequeña escala.

Las credenciales sensibles —token de OpenRouter, credenciales de Google Calendar, cadena de conexión a PostgreSQL— se gestionan como variables de entorno, sin exponerse en el código fuente ni en el repositorio.

### 5.6 Pruebas y validación

El plan de pruebas contempló dos niveles:

**Pruebas unitarias de flujo**: se verificó el comportamiento de los nodos críticos del workflow de n8n de forma aislada, particularmente los nodos Code in JavaScript responsables de la validación de horarios, el parseo de JSON y la construcción de mapeos.

**Pruebas de integración conversacional**: se probaron los flujos completos desde el mensaje enviado por el chat del frontend hasta la respuesta final, verificando:
- Que el AI Agent clasificador identificara correctamente cada intención.
- Que la máquina de estados enrutara correctamente los mensajes subsecuentes.
- Que las validaciones de horario (días hábiles, rango 8-13 y 17-21) funcionaran para casos válidos e inválidos.
- Que la detección de conflictos de horario evitara el solapamiento de citas.
- Que la creación de eventos en Google Calendar se realizara correctamente.
- Que las consultas SQL retornaran solo citas futuras.

Las pruebas fueron realizadas exclusivamente por el equipo de desarrollo, sin participación de usuarios externos.

---

## Capítulo 6: Resultados

### 6.1 Validación funcional de flujos

La tabla siguiente resume el estado de cada flujo principal tras las pruebas de validación funcional.

| Flujo | Estado | Resultado |
|---|---|---|
| Agendamiento | Funcional | El sistema interpreta correctamente la intención, guía al usuario paso a paso (mascota → fecha/hora), valida reglas de negocio y confirma la cita en PostgreSQL y Google Calendar. |
| Reprogramación | Funcional | El sistema lista mascotas y citas vigentes, identifica la cita a modificar mediante mapeo numérico, valida la nueva fecha/hora y actualiza la cita y el evento de Google Calendar. |
| Cancelación | Funcional | El sistema identifica la cita a cancelar, solicita confirmación, elimina el registro de PostgreSQL y el evento de Google Calendar. |
| Consulta | Funcional | El sistema ejecuta la consulta SQL con JOIN y retorna exclusivamente las citas futuras confirmadas, formateadas como lista legible. |
| Saludo / Despedida | Funcional | El sistema responde con mensajes cordiales predefinidos y no interfiere con flujos activos. |

Los cuatro flujos principales —agendar, reprogramar, cancelar, consultar— fueron probados exhaustivamente con múltiples variaciones de mensajes, fechas y horarios, y en todos los casos el sistema respondió de acuerdo con el comportamiento esperado.

### 6.2 Problemas encontrados y soluciones implementadas

El desarrollo iterativo permitió identificar y resolver seis problemas significativos que se detallan a continuación.

**1. Pérdida de estado conversacional**

*Problema*: Durante el flujo de agendamiento, si el usuario enviaba un mensaje no relacionado —por ejemplo, "hola" cuando el sistema esperaba un número de mascota—, Simple Memory no retenía el contexto y el agente reiniciaba la conversación desde cero.

*Solución*: Se implementó una máquina de estados explícita a nivel de base de datos, utilizando la columna `estado` de la tabla `citas`. Cada paso del flujo conversacional actualiza el estado (`agendando` → `espagenda` → fecha/hora → `confirmado`). Un Switch adicional en n8n evalúa el estado actual de la cita del cliente antes de procesar el mensaje, garantizando que el sistema siempre sepa en qué paso del flujo se encuentra, independientemente de lo que el usuario escriba. Si el mensaje no corresponde al paso actual, el sistema lo trata como `desconocido` y mantiene el estado, en lugar de reiniciar.

**2. Interpretación de fechas relativas**

*Problema*: Los usuarios expresan fechas en lenguaje natural relativo: "mañana", "el lunes", "pasado mañana". El AI Agent necesitaba saber la fecha actual para interpretar correctamente estas expresiones.

*Solución*: Se inyecta la fecha y hora actual —con zona horaria `America/Argentina/Buenos_Aires`— directamente en el system prompt del AI Agent extractor mediante la expresión `$now.setZone('America/Argentina/Buenos_Aires').format('yyyy-MM-dd')` de n8n. Esto permite que el modelo, al recibir el mensaje "mañana a las 10", tenga como contexto que "hoy es 2026-06-24" y pueda calcular "mañana = 2026-06-25".

**3. Validación de disponibilidad y reglas de negocio**

*Problema*: El sistema permitía agendar turnos en fines de semana o fuera del horario de atención (8-13 y 17-21), y no detectaba conflictos de horario con citas existentes.

*Solución*: Se implementaron tres capas de validación en el nodo Code in JavaScript posterior al AI Agent extractor:
- **Validación de día**: se calcula el día de la semana de la fecha proporcionada (`getUTCDay()`), rechazando sábados (6) y domingos (0).
- **Validación de horario**: se convierte la hora a minutos totales y se verifica que esté en el rango 480-780 (8:00-13:00) o 1020-1260 (17:00-21:00).
- **Validación de conflicto**: un nodo PostgreSQL consulta si existe una cita confirmada con la misma fecha, hora y estado `confirmado`. Si existe, se rechaza el turno.

**4. Errores en la reprogramación**

*Problema*: Durante la reprogramación, el sistema ocasionalmente modificaba la cita equivocada o eliminaba el registro en lugar de actualizarlo. El problema se originaba en la ambigüedad entre la selección del usuario ("la número 2") y el ID real de la cita en la base de datos.

*Solución*: Se implementó un sistema de mapeo numérico temporal. Cuando el sistema lista las citas disponibles para reprogramar, asigna números secuenciales (1, 2, 3...) y guarda la correspondencia número-ID en el campo `notas` de la tabla `citas` como un JSON: `{"1": 45, "2": 72, "3": 89}`. Cuando el usuario responde con un número, el sistema recupera el mapeo del campo `notas` y obtiene el ID real. Este JSON se sobrescribe en cada paso del flujo, actuando como memoria auxiliar de la conversación.

**5. Consultas SQL mostrando citas pasadas**

*Problema*: El flujo de consulta (`consultar`) retornaba todas las citas confirmadas del cliente, incluyendo aquellas con fecha y hora ya transcurridas. Esto generaba confusión, ya que el usuario esperaba ver únicamente sus turnos pendientes.

*Solución*: Se refinó la consulta SQL agregando una condición compuesta que filtra exclusivamente citas futuras: `(c.fecha::date > CURRENT_DATE OR (c.fecha::date = CURRENT_DATE AND c.hora >= CURRENT_TIME AT TIME ZONE 'America/Argentina/Buenos_Aires'))`. Para el panel de administración, una consulta separada retorna todas las citas sin este filtro, permitiendo al veterinario ver el historial completo.

**6. Acceso al modelo de lenguaje**

*Problema*: La intención original era utilizar directamente la API de OpenAI con el modelo chatgpt-mini, pero el proceso de compra de créditos fue rechazado por el sistema de pagos de OpenAI con los medios disponibles.

*Solución*: Se migró a OpenRouter como capa de intermediación. OpenRouter expone una API compatible que permite acceder a modelos de múltiples proveedores —incluyendo chatgpt-mini de OpenAI— a través de un único endpoint y con opciones de pago alternativas. Esta migración no requirió modificar la lógica de los agentes; solo fue necesario cambiar la configuración del nodo `OpenRouter Chat Model` en n8n y las credenciales correspondientes.

---

## Capítulo 7: Discusión

### 7.1 Contraste entre hipótesis y resultados

La hipótesis central del trabajo planteaba que un agente conversacional basado en IA, integrado con una aplicación web mediante la plataforma n8n, sería capaz de gestionar de forma autónoma el ciclo completo de un turno veterinario sin requerir software propietario ni infraestructura costosa, y con una barrera de adopción menor que las soluciones basadas en bots de mensajería.

Los resultados de la validación funcional confirman la primera parte de la hipótesis: el sistema implementado gestiona efectivamente los cuatro flujos —agendamiento, reprogramación, cancelación y consulta— de manera autónoma, interpretando lenguaje natural y ejecutando las operaciones correspondientes en PostgreSQL y Google Calendar sin intervención humana.

La segunda parte de la hipótesis —la menor barrera de adopción respecto a los bots de mensajería— no pudo ser validada empíricamente al no haberse realizado pruebas con usuarios reales. Sin embargo, el argumento que la sustenta es sólido desde la teoría de usabilidad: eliminar la necesidad de instalar una aplicación adicional reduce objetivamente los pasos requeridos para que un usuario acceda al sistema. Futuras evaluaciones con usuarios serán necesarias para confirmar esta ventaja con datos.

### 7.2 Contraste con la literatura

El presente trabajo se distingue de los antecedentes revisados en varios aspectos. En primer lugar, la integración de AI Agents con memoria conversacional en una plataforma de orquestación (n8n), expuestos a través de una API REST y consumidos por una SPA React, representa una arquitectura más compleja y modular que la de los bots de mensajería documentados en la literatura (Herrera & Pinto, 2021; Gómez et al., 2022). Esta arquitectura ofrece ventajas de mantenibilidad y escalabilidad, pero también introduce una mayor complejidad de desarrollo.

En segundo lugar, la máquina de estados implementada a nivel de base de datos —como solución al problema de pérdida de contexto conversacional— es un aporte técnico que no se encuentra documentado en los antecedentes revisados. Los bots conversacionales típicamente dependen exclusivamente de la memoria del agente para mantener el contexto; VetFlow demostró que esta dependencia es frágil en flujos de múltiples pasos y que una capa adicional de estado transaccional resuelve el problema de manera robusta.

En tercer lugar, el cambio de canal —de Telegram a aplicación web— representa una decisión arquitectónica fundamentada en la experiencia de campo que es consistente con los hallazgos de Vest & Gamm (2010) sobre la importancia de la simplicidad percibida en la adopción tecnológica. La literatura sobre bots de mensajería tiende a asumir que la penetración de estas plataformas garantiza la adopción; este trabajo aporta evidencia anecdótica pero concreta de que "usar una app de mensajería" y "gestionar turnos veterinarios a través de ella" son conductas diferentes.

### 7.3 Limitaciones y amenazas a la validez

La principal limitación de este trabajo es la ausencia de pruebas con usuarios reales. Los cuatro flujos fueron validados funcionalmente por el equipo de desarrollo, pero no se evaluó la experiencia de usuarios finales (propietarios de mascotas) ni del personal veterinario. Esto implica que no se dispone de métricas cuantitativas de usabilidad, satisfacción o reducción de carga administrativa que permitan validar la hipótesis en su totalidad.

La segunda limitación significativa es el tamaño del equipo de desarrollo. Dos personas trabajando con dedicación parcial —condicionada por la cursada simultánea de otras materias— impusieron restricciones en la velocidad de desarrollo y en la profundidad de las pruebas.

La tercera limitación es la ausencia de pruebas automatizadas. Todas las validaciones fueron manuales, lo que limita la capacidad de detectar regresiones ante cambios futuros en el sistema.

La cuarta limitación refiere a la dependencia de servicios externos: el sistema requiere que n8n, OpenRouter, PostgreSQL y Google Calendar estén operativos. Una falla en cualquiera de estos componentes afecta la funcionalidad completa del chat.

### 7.4 Implicancias para la práctica

Más allá de los resultados específicos, este trabajo tiene implicancias prácticas que trascienden el dominio veterinario. La combinación de FastAPI + React + n8n + PostgreSQL constituye un stack tecnológico reutilizable para sistemas de agendamiento conversacional en cualquier servicio de salud o actividad profesional de pequeña escala que enfrente problemas similares: consultorios médicos, odontológicos, kinesiológicos, tutorías académicas, servicios de reparaciones, entre otros.

El costo operativo mensual inferior a USD 12, la ausencia de licencias propietarias, y la independencia de plataformas de mensajería de terceros eliminan simultáneamente las barreras económicas, técnicas y de adopción que típicamente impiden la digitalización de estos segmentos.

---

## Capítulo 8: Conclusiones

### 8.1 Síntesis de aportes

Este trabajo demostró que es posible construir un sistema conversacional de gestión de citas veterinarias potenciado por IA, desplegado como una aplicación web con chatbot embebido, utilizando exclusivamente herramientas open-source o de bajo costo, con un costo operativo mensual inferior a USD 12 y en un tiempo de desarrollo de aproximadamente dos meses para un equipo de dos personas con dedicación parcial.

Los principales aportes del trabajo son:

1. **Arquitectura de tres capas**: la combinación de React (presentación), FastAPI (lógica de negocio) y n8n (inteligencia conversacional) demostró ser técnicamente viable y conceptualmente clara, con responsabilidades bien definidas en cada capa.

2. **Máquina de estados conversacional**: la implementación de una máquina de estados a nivel de base de datos (columna `estado` en la tabla `citas`) resolvió el problema de pérdida de contexto en flujos conversacionales de múltiples pasos, superando las limitaciones de Simple Memory como único mecanismo de persistencia.

3. **Validación en múltiples capas**: la combinación de validación vía AI Agent (interpretación de lenguaje natural) y validación vía código determinístico (días hábiles, rangos horarios, conflictos de horario) demostró ser una estrategia efectiva para garantizar la corrección de las operaciones.

4. **Migración de canal**: el cambio de Telegram a aplicación web, motivado por la barrera de adopción detectada en el relevamiento de campo, representa una decisión arquitectónica documentada y fundamentada que puede servir de referencia para proyectos similares.

5. **Independencia de proveedores de IA**: el uso de OpenRouter como capa de abstracción sobre el modelo de lenguaje permite cambiar de proveedor sin modificar el código del sistema, una característica valiosa en un ecosistema de IA en rápida evolución.

### 8.2 Trabajo futuro

Las líneas de trabajo futuro más relevantes son:

1. **Evaluación con usuarios reales**: desplegar el sistema en al menos una clínica veterinaria durante un período controlado, aplicando la System Usability Scale (SUS) y midiendo indicadores cuantitativos de carga administrativa, errores de turno y satisfacción.

2. **Autenticación con JWT**: reemplazar el mecanismo actual de identificación por `cliente_id` en query params por tokens JWT, mejorando la seguridad y habilitando la expiración de sesiones.

3. **Pruebas automatizadas**: implementar tests unitarios y de integración para el backend (pytest) y el frontend, así como pruebas de los flujos de n8n.

4. **Recordatorios automáticos**: agregar notificaciones previas al turno, idealmente por correo electrónico, y explorar nuevamente la viabilidad de WhatsApp en caso de que las restricciones de la API se flexibilicen.

5. **Modelo de lenguaje local**: evaluar la viabilidad de reemplazar OpenRouter por un modelo de lenguaje ejecutado localmente (on-premise), eliminando la dependencia de servicios externos y el costo asociado.

6. **Módulo de historia clínica**: incorporar un módulo simplificado de historia clínica que persista datos de cada mascota entre visitas.

7. **Estudio longitudinal**: realizar un estudio de mayor duración y con una muestra más amplia de clínicas que permita superar las limitaciones de validez del presente trabajo.

### 8.3 Reflexión final

VetFlow es el resultado de un proceso iterativo de aprendizaje en el que cada obstáculo —desde el rechazo de la tarjeta para comprar tokens de OpenAI hasta la pérdida de contexto en las conversaciones del bot— se convirtió en una oportunidad para mejorar el diseño. La versión actual del sistema es sustancialmente diferente de la concebida inicialmente, y esa diferencia es en sí misma el producto más valioso del trabajo: la demostración de que el desarrollo de software aplicado a problemas reales es un proceso de adaptación continua, no de ejecución de un plan predefinido.

El principio de diseño que guió todas las decisiones —priorizar la accesibilidad del usuario sobre la sofisticación técnica— se mantuvo constante. Primero fue Telegram, porque los datos decían que los usuarios lo usaban. Después fue la web, porque la experiencia dijo que los datos no capturaban la barrera de tener que instalar una app. Y en cada iteración, el sistema se volvió más simple de usar para quien realmente importa: el dueño de la mascota que solo quiere un turno para el veterinario sin tener que aprender a usar nada nuevo.

---

## Referencias Bibliográficas

Bangor, A., Kortum, P., & Miller, J. (2008). An empirical evaluation of the System Usability Scale. *International Journal of Human-Computer Interaction*, 24(6), 574–594.

Brooke, J. (1996). SUS: A 'quick and dirty' usability scale. En P. Jordan et al. (Eds.), *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.

Brown, T. B., Mann, B., Ryder, N., et al. (2020). Language models are few-shot learners. *Advances in Neural Information Processing Systems*, 33, 1877–1901.

Chase, H. (2022). LangChain [Software]. GitHub. https://github.com/langchain-ai/langchain

Consejo Profesional de Medicina Veterinaria de la Nación. (2023). Informe estadístico de establecimientos habilitados. CPVN.

Dijkstra, E. W. (1974). On the role of scientific thought. En *Selected Writings on Computing: A Personal Perspective* (pp. 60–66). Springer.

Dumas, M., La Rosa, M., Mendling, J., & Reijers, H. A. (2018). *Fundamentals of Business Process Management* (2.ª ed.). Springer.

Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* [Tesis doctoral]. University of California, Irvine.

Flanagan, D. (2020). *JavaScript: The Definitive Guide* (7.ª ed.). O'Reilly Media.

Gómez, L., Torres, M., & Salas, R. (2022). Automatización de agendamiento en centros de salud primaria: una experiencia en Colombia. *Revista Iberoamericana de Sistemas, Cibernética e Informática*, 19(1), 45–53.

Herrera, P., & Pinto, C. (2021). Bot de agendamiento odontológico sobre WhatsApp: diseño e impacto en consultorios de Santiago de Chile. *Informática en Salud*, 14(2), 12–21.

Hohpe, G., & Woolf, B. (2003). *Enterprise Integration Patterns: Designing, Building, and Deploying Messaging Solutions*. Addison-Wesley.

n8n Documentation (2024). Workflow automation platform. https://docs.n8n.io

Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.

Palanica, A., Flaschner, P., Thommandram, A., Li, M., & Fossat, Y. (2019). Physicians' perceptions of chatbots in health care: Cross-sectional web-based survey. *Journal of Medical Internet Research*, 21(4), e12887.

Pressman, R. S. (2014). *Ingeniería del software: un enfoque práctico* (7.ª ed.). McGraw-Hill.

Richardson, C., & Kulkarni, J. (2021). Low-code/no-code platforms: Survey and classification. *IEEE Software*, 38(4), 77–84.

Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4.ª ed.). Pearson.

Sommerville, I. (2016). *Software Engineering* (10.ª ed.). Pearson.

van der Aalst, W., ter Hofstede, A., & Weske, M. (2003). Business Process Management: A survey. *Lecture Notes in Computer Science*, 2678. Springer.

Vest, J. R., & Gamm, L. D. (2010). Health information exchange: persistent challenges and new strategies. *Journal of the American Medical Informatics Association*, 17(3), 288–294.

---

## Anexo A: Diagrama de Arquitectura del Sistema

El siguiente esquema representa la arquitectura de alto nivel de VetFlow, mostrando la relación entre los componentes del sistema y los servicios externos integrados.

```
┌─────────────────────────────────────────────────────────┐
│                  USUARIO FINAL                           │
│  (Propietario de mascota / Personal veterinario)        │
│  Navegador web (Chrome, Firefox, Safari, etc.)          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN                        │
│  React 19 SPA (Vite)                                    │
│  ┌──────────┬──────────┬──────────────────────────────┐ │
│  │  Login   │ Register │  Dashboard (Inicio)           │ │
│  │          │          │  ┌────────────────────────┐   │ │
│  │          │          │  │ ChatWidget (chatbot)   │   │ │
│  │          │          │  │ Mis Mascotas (CRUD)    │   │ │
│  │          │          │  │ Mis Citas (listado)    │   │ │
│  │          │          │  │ Admin (calendario)     │   │ │
│  │          │          │  └────────────────────────┘   │ │
│  └──────────┴──────────┴──────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (fetch)
                         ↓
┌─────────────────────────────────────────────────────────┐
│            CAPA DE LÓGICA DE NEGOCIO                     │
│  FastAPI 0.115 (Python 3.11)                            │
│  ┌─────────┬──────────┬────────┬──────────────────────┐ │
│  │ Auth    │ Mascotas │ Citas  │ Chat (proxy)         │ │
│  │ bcrypt  │ CRUD     │ listado│ POST → n8n webhook   │ │
│  └─────────┴──────────┴────────┴──────────────────────┘ │
│  Patrones: Unit of Work, Repository                     │
│  ORM: SQLAlchemy 2.0                                    │
└────────────────────────┬────────────────────────────────┘
                         │ SQL
                         ↓
┌─────────────────────────────────────────────────────────┐
│              CAPA DE DATOS                               │
│  PostgreSQL                                             │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │ clientes     │ mascotas     │ citas                │ │
│  │ id, nombre,  │ id, cliente, │ id, cliente, mascota │ │
│  │ dni, user,   │ nombre,      │ fecha, hora, estado, │ │
│  │ password, rol│ especie, etc.│ notas, calendar_id   │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────┘

                         ┌─────────────────────────────┐
                         │   CAPA DE INTELIGENCIA      │
                         │   n8n (Docker, self-hosted) │
                         │                             │
                         │   Webhook ← POST /api/chat  │
                         │        ↓                    │
                         │   AI Agent clasificador      │
                         │   (OpenRouter chatgpt-mini)  │
                         │        ↓                    │
                         │   Switch (6 intenciones)     │
                         │   ↙ ↓ ↓ ↓ ↓ ↘              │
                         │   Sub-flujos:               │
                         │   agendar, consultar,       │
                         │   reprogramar, cancelar,    │
                         │   saludo, despedida         │
                         │        ↓                    │
                         │   PostgreSQL nodes          │
                         │        ↓                    │
                         │   Google Calendar API       │
                         │        ↓                    │
                         │   Respond to Webhook        │
                         └─────────────────────────────┘
```

---

## Anexo B: Estructura del Workflow en n8n

El workflow principal de VetFlow, denominado "actu", está implementado en n8n y se organiza en los siguientes nodos:

### Nodos principales

| Nodo | Tipo | Función |
|---|---|---|
| Webhook | Webhook (POST) | Recibe `{ cliente_id, mensaje }` desde el backend FastAPI. Punto de entrada del flujo. |
| If "salir" | IF | Detecta si el mensaje es "salir". Si es verdadero, inserta la cita actual en PostgreSQL y responde "Salio..". |
| Select rows from a table1 | PostgreSQL (SELECT) | Consulta la cita más reciente del cliente, ordenada por id descendente. |
| Switch (estado) | Switch | Evalúa `$json.estado` de la cita actual y enruta: `agendando`, `espagenda`, `espreprogramar`, `reprogramando`, `reprofeho`, `cancelando`, `cancefeho`. |
| Simple Memory | Memory (Buffer Window) | Persiste contexto conversacional. Session key configurada con el mensaje del usuario. |
| AI Agent1 | AI Agent (LangChain) | Clasifica la intención del mensaje. System prompt define 6 acciones + reglas estrictas. |
| OpenRouter Chat Model1 | LLM (OpenRouter) | Modelo chatgpt-mini accedido vía OpenRouter API. |
| de texto a json | Code (JavaScript) | Limpia la respuesta del AI Agent (quita \`\`\`json) y parsea el JSON. |
| determina estado | Switch | Evalúa `$json.accion` y enruta a: agendar, consultar, reprogramar, cancelar, saludo, despedida. |

### Sub-flujo: Agendamiento

| Nodo | Tipo | Función |
|---|---|---|
| agendar | PostgreSQL (INSERT) | Inserta fila con `cliente_id` y `estado: "agendando"`. |
| Select rows from a table | PostgreSQL (SELECT) | Consulta mascotas del cliente. |
| Code in JavaScript5 | Code | Construye lista de mascotas con mapeo JSON `{"1": id, "2": id}`. |
| Respond to Webhook5 | Respond | Responde con la lista de mascotas. |
| Code in JavaScript6 | Code | Recupera el mapeo y obtiene el `mascota_id` según la opción elegida. |
| Update rows in a table1 | PostgreSQL (UPDATE) | Actualiza `mascota_id` y `estado: "espagenda"`. |
| Code in JavaScript11 | Code | Responde "¿Para qué fecha y hora querés el turno?". |
| Respond to Webhook8 | Respond | Envía la pregunta al usuario. |
| Simple Memory1 | Memory | Contexto para el agente extractor de fechas. |
| AI Agent | AI Agent | Extrae fecha y hora del mensaje. System prompt con fecha actual inyectada. |
| OpenRouter Chat Model | LLM | chatgpt-mini vía OpenRouter. |
| Code in JavaScript | Code | Valida día hábil, rango horario y completitud. |
| If2 | IF | Evalúa si `valido === true`. |
| Select rows from a table2 | PostgreSQL (SELECT) | Verifica conflictos de horario (misma fecha + hora + estado confirmado). |
| If1 | IF | Evalúa si existe conflicto. |
| Create an event | Google Calendar | Crea el evento en Google Calendar. |
| Update rows in a table | PostgreSQL (UPDATE) | Actualiza `fecha`, `hora` y `estado: "confirmado"`. |
| Respond to Webhook10 | Respond | "Cita creada EXITOSAMENTE". |
| Respond to Webhook11 | Respond | "Lo siento, ese horario ya está ocupado". |
| Insert rows in a table4 | PostgreSQL (INSERT) | Inserta cita con `estado: "espagenda"` si hubo conflicto (para reintento). |
| Respond to Webhook12 | Respond | Envía mensaje de error si fecha/hora inválidas. |
| Insert rows in a table6 | PostgreSQL (INSERT) | Inserta cita con `estado: "espagenda"` si validación falló. |

### Sub-flujo: Consulta

| Nodo | Tipo | Función |
|---|---|---|
| consulta | PostgreSQL (RAW SQL) | Ejecuta SELECT con JOIN citas+mascotas, filtrando solo citas futuras confirmadas. |
| Code in JavaScript1 | Code | Formatea los resultados como lista legible. |
| Respond to Webhook3 | Respond | Envía la lista de citas al usuario. |

### Sub-flujo: Reprogramación

| Nodo | Tipo | Función |
|---|---|---|
| reprogramando | PostgreSQL (INSERT) | Inserta fila con `estado: "reprogramando"`. |
| Select rows from a table3 | PostgreSQL (SELECT) | Consulta mascotas del cliente. |
| Code in JavaScript7 | Code | Construye lista de mascotas con mapeo JSON. |
| Respond to Webhook4 | Respond | Pregunta "¿Para qué mascota querés reprogramar?". |
| Update rows in a table3 | PostgreSQL (UPDATE) | Actualiza `mascota_id` y `estado: "espreprogramar"`. |
| Code in JavaScript12 | Code | Consulta citas futuras de la mascota seleccionada. |
| Update rows in a table5 | PostgreSQL (UPDATE) | Actualiza `estado: "reprofeho"` y guarda mapeo en `notas`. |
| Respond to Webhook13 | Respond | Pregunta "¿Cuál cita querés reprogramar?". |
| Code in JavaScript9 | Code | Recupera el mapeo y obtiene el `cita_id` real. |
| Select rows from a table6 | PostgreSQL (SELECT) | Verifica si la cita existe. |
| Simple Memory2 | Memory | Contexto para el agente extractor. |
| AI Agent2 | AI Agent | Extrae nueva fecha y hora. |
| OpenRouter Chat Model2 | LLM | chatgpt-mini vía OpenRouter. |
| Code in JavaScript2 | Code | Valida día hábil, rango horario y completitud. |
| If4 | IF | Evalúa validez. |
| Select rows from a table5 | PostgreSQL (SELECT) | Verifica conflictos. |
| If3 | IF | Evalúa si hay conflicto. |
| Update rows in a table7 | PostgreSQL (UPDATE) | Actualiza `fecha`, `hora`, `estado: "confirmado"`. |
| Respond to Webhook15 | Respond | "Cita reprogramada EXITOSAMENTE". |
| Respond to Webhook16 | Respond | "Lo siento, ese horario ya está ocupado". |
| Insert rows in a table | PostgreSQL (INSERT) | Inserta cita con `estado: "espagenda"` si hubo conflicto. |
| Respond to Webhook17 | Respond | Error si fecha/hora inválida. |
| Insert rows in a table7 | PostgreSQL (INSERT) | Cita pendiente si falló validación. |

### Sub-flujo: Cancelación

| Nodo | Tipo | Función |
|---|---|---|
| cancelar | PostgreSQL (INSERT) | Inserta fila con `estado: "cancelando"`. |
| Select rows from a table4 | PostgreSQL (SELECT) | Consulta mascotas del cliente. |
| Code in JavaScript8 | Code | Construye lista con mapeo. |
| Respond to Webhook | Respond | Pregunta "¿Para qué mascota querés cancelar?". |
| Update rows in a table4 | PostgreSQL (UPDATE) | Actualiza `estado: "cancefeho"` y guarda mapeo. |
| Code in JavaScript10 | Code | Recupera el mapeo y obtiene el `cita_id`. |
| Respond to Webhook14 | Respond | "Cita cancelada correctamente". |

### Sub-flujo: Saludo y Despedida

| Nodo | Tipo | Función |
|---|---|---|
| saludo | Respond to Webhook | Responde "hola desde n8n!". |
| salida | Respond to Webhook | Responde "chau desde n8n!". |

---

## Anexo C: System Prompts de los AI Agents

### AI Agent clasificador de intenciones

```
Tu fecha y hora actual de referencia es:
{{ $now.setZone('America/Argentina/Buenos_Aires').format('EEEE d "de" MMMM "de" yyyy, HH:mm') }}
Zona horaria: Mendoza/Buenos Aires, Argentina.

Sos un asistente que SOLO clasifica intenciones.
Respondé únicamente en JSON válido, sin texto extra.

Posibles acciones:
- agendar
- reprogramar
- cancelar
- consultar
- saludo (cuando el usuario saluda explícitamente: "hola", "buenas", "buen día")
- desconocido (cualquier mensaje que no sea una acción clara ni un saludo explícito)
- despedida (cuando el usuario agradece o se despide: "gracias", "ok gracias", "chau", "hasta luego")

También extraé:
- fecha (si existe)
- hora (si existe)
- titulo (si existe, el nombre o descripción de la cita)
- event_id (si el usuario menciona un número o nombre de cita para reprogramar o cancelar, buscalo en el historial de conversación)

Formato de respuesta:
{
  "accion": "agendar",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM",
  "titulo": null,
  "event_id": null
}

Reglas:
- Si no hay fecha, poner null
- Si no hay hora, poner null
- Si no hay titulo, poner null
- Si no hay event_id, poner null
- No inventar datos
- "ok", "si", "no" y mensajes cortos sin sentido = desconocido
- "gracias", "ok gracias", "chau", "hasta luego", "perfecto", "genial" = despedida
- Un número solo ("1", "2", "3") = SIEMPRE desconocido, nunca una acción nueva
- Una fecha o una hora sola sin contexto = desconocido
- Si el mensaje es una respuesta corta a una pregunta anterior = desconocido
```

### AI Agent extractor de fechas

```
Mensaje del usuario: {{ $('Webhook').item.json.body.mensaje }}

Extraé fecha y hora. Respondé SOLO en JSON válido:
{
  "fecha": "YYYY-MM-DD o null",
  "hora": "HH:MM o null",
  "completo": true/false,
  "mensaje_falta": "mensaje si falta algo o null"
}

Reglas:
- Interpretá fechas relativas: "mañana", "el lunes", etc.
- Fecha actual: {{ $now.setZone('America/Argentina/Buenos_Aires').format('yyyy-MM-dd') }}
```
