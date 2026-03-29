import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

export default function TermosPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoContainer}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={60}
            height={60}
            className={styles.headerLogo}
          />
          <h1 className={styles.headerTitle}>Mineartecraft</h1>
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <h2 className={styles.title}>Termos de Serviço</h2>
          <p className={styles.lastUpdated}>Última atualização: 29 de Março de 2026</p>

          <section className={styles.section}>
            <h3>1. Sobre o Serviço</h3>
            <p>
              O site Mineartecraft atua como um catálogo digital de produtos artesanais em crochê. Nosso objetivo é apresentar as criações e facilitar o contato direto com o artesão para encomendas e dúvidas.
            </p>
          </section>

          <section className={styles.section}>
            <h3>2. Pedidos e Encomendas</h3>
            <p>
              A Mineartecraft não processa pagamentos diretamente pelo site. Ao clicar em "Ver detalhes" e solicitar um produto, você será redirecionado para o WhatsApp oficial. Todos os detalhes de pagamento, prazos de entrega e especificações do produto são acordados diretamente via WhatsApp.
            </p>
          </section>

          <section className={styles.section}>
            <h3>3. Natureza dos Produtos</h3>
            <p>
              Por se tratarem de peças 100% artesanais e feitas à mão, podem ocorrer pequenas variações de tonalidade, tamanho e textura em relação às fotos apresentadas no catálogo. Cada peça é única.
            </p>
          </section>

          <section className={styles.section}>
            <h3>4. Prazos e Entregas</h3>
            <p>
              O prazo de produção e o custo de envio variam de acordo com o produto e a localização do cliente. Essas informações serão fornecidas de forma clara durante o atendimento individual.
            </p>
          </section>

          <section className={styles.section}>
             <h3>5. Privacidade</h3>
             <p>
               Valorizamos sua privacidade. Não coletamos dados pessoais sensíveis ou informações de pagamento através deste catálogo. O redirecionamento para redes sociais ou WhatsApp segue as políticas de privacidade dessas plataformas externas.
             </p>
          </section>

          <div className={styles.footer}>
            <Link href="/" className={styles.backButton}>Voltar para o Catálogo</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
