import json
import os
import sys
import time

# Nome do arquivo de armazenamento de dados
ARQUIVO_DADOS = "alunos.json"

# Ajusta a codificação do terminal no Windows
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
    os.system("")  # Habilita suporte a códigos de cores ANSI no CMD do Windows

# Cores Tema Matrix
GREEN       = "\033[92m"    # Verde matriz brilhante
DARK_GREEN  = "\033[32m"    # Verde matriz escuro
BOLD_GREEN  = "\033[1;92m"  # Verde matriz negrito
RED         = "\033[91m"    # Vermelho erros
BOLD_RED    = "\033[1;91m"  # Vermelho negrito erros
RESET       = "\033[0m"     # Reseta cor

LARGURA_BOX = 60

def carregar_alunos():
    """Carrega os alunos do arquivo JSON se ele existir."""
    if os.path.exists(ARQUIVO_DADOS):
        try:
            with open(ARQUIVO_DADOS, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def salvar_alunos(alunos):
    """Salva a lista atualizada de alunos no arquivo JSON."""
    try:
        with open(ARQUIVO_DADOS, "w", encoding="utf-8") as f:
            json.dump(alunos, f, ensure_ascii=False, indent=4)
    except Exception as e:
        mensagem_erro(f"Erro ao salvar dados no arquivo: {e}")

def limpar_tela():
    """Limpa o terminal (compatível com Windows, Linux e Mac)."""
    os.system("cls" if os.name == "nt" else "clear")

def exibir_banner(titulo):
    """Exibe um cabeçalho no estilo Matrix perfeitamente alinhado."""
    linha_borda = "=" * LARGURA_BOX
    print(f"{GREEN}+{linha_borda}+{RESET}")
    print(f"{GREEN}|{BOLD_GREEN}{titulo:^{LARGURA_BOX}}{RESET}{GREEN}|{RESET}")
    print(f"{GREEN}+{linha_borda}+{RESET}\n")

def exibir_item_menu(opcao, icone, texto):
    """Imprime um item do menu com o alinhamento da borda direita exato."""
    visivel = f"[{opcao}] {icone} {texto}"
    espacos_sobrando = LARGURA_BOX - 2 - len(visivel)
    preenchimento = " " * max(0, espacos_sobrando)
    
    print(f"  {GREEN}|{RESET}  {BOLD_GREEN}[{opcao}]{RESET} {GREEN}{icone} {texto}{preenchimento}{GREEN}|{RESET}")

def exibir_menu():
    exibir_banner("SYSTEM // CADASTRO DE ALUNOS")
    linha_tracada = "-" * LARGURA_BOX
    print(f"  {GREEN}+{linha_tracada}+{RESET}")
    exibir_item_menu("1", "[+]", "Cadastrar Novo Aluno")
    exibir_item_menu("2", "[*]", "Listar Todos os Alunos")
    exibir_item_menu("3", "[?]", "Pesquisar Aluno (Nome/Mat/Tel)")
    exibir_item_menu("4", "[-]", "Remover Aluno")
    exibir_item_menu("0", "[x]", "Sair do Sistema")
    print(f"  {GREEN}+{linha_tracada}+{RESET}")

def mensagem_sucesso(msg):
    print(f"\n  {BOLD_GREEN}[OK] {msg}{RESET}")

def mensagem_erro(msg):
    print(f"\n  {BOLD_RED}[ERRO] {msg}{RESET}")

def mensagem_info(msg):
    print(f"\n  {GREEN}[INFO] {msg}{RESET}")

def pausar():
    input(f"\n  {BOLD_GREEN}[>] Pressione ENTER para continuar...{RESET}")

def cadastrar_aluno(alunos):
    while True:
        limpar_tela()
        exibir_banner("CADASTRAR NOVO ALUNO")
        print(f"  {DARK_GREEN}(Digite 'SAIR' a qualquer momento para voltar ao menu principal){RESET}\n")
        
        nome = input(f"  {BOLD_GREEN}[+] Digite o nome completo:{RESET} ").strip()
        if nome.upper() == "SAIR":
            return False

        if not nome:
            mensagem_erro("O nome do aluno é obrigatório!")
            input(f"\n  {BOLD_GREEN}[>] Pressione ENTER para tentar novamente...{RESET}")
            continue
        if not all(c.isalpha() or c.isspace() for c in nome):
            mensagem_erro("O nome do aluno deve conter apenas letras e espaços!")
            input(f"\n  {BOLD_GREEN}[>] Pressione ENTER para tentar novamente...{RESET}")
            continue

        matricula = input(f"  {BOLD_GREEN}[+] Digite a matrícula do aluno:{RESET} ").strip()
        if matricula.upper() == "SAIR":
            return False

        if not matricula.isdigit():
            mensagem_erro("A matrícula deve conter apenas números inteiros!")
            input(f"\n  {BOLD_GREEN}[>] Pressione ENTER para tentar novamente...{RESET}")
            continue

        # Verificar se a matrícula já existe
        existe = False
        for aluno in alunos:
            if aluno['matricula'] == matricula:
                existe = True
                break
        if existe:
            mensagem_erro("Já existe um aluno cadastrado com essa matrícula!")
            input(f"\n  {BOLD_GREEN}[>] Pressione ENTER para tentar novamente...{RESET}")
            continue

        telefone = input(f"  {BOLD_GREEN}[+] Digite o telefone:{RESET} ").strip()
        if telefone.upper() == "SAIR":
            return False

        if not telefone.isdigit():
            mensagem_erro("O telefone deve conter apenas números inteiros!")
            input(f"\n  {BOLD_GREEN}[>] Pressione ENTER para tentar novamente...{RESET}")
            continue

        aluno = {
            "nome": nome,
            "matricula": matricula,
            "telefone": telefone
        }
        alunos.append(aluno)
        salvar_alunos(alunos)
        mensagem_sucesso(f"Aluno(a) '{nome}' cadastrado(a) com sucesso!")
        return True

def listar_alunos(alunos):
    limpar_tela()
    exibir_banner("LISTA DE ALUNOS CADASTRADOS")

    if not alunos:
        mensagem_info("Nenhum aluno cadastrado no sistema no momento.")
        return

    print(f"  {BOLD_GREEN}Total de alunos cadastrados:{RESET} {GREEN}{len(alunos)}{RESET}\n")
    print(f"  {GREEN}+-----------------+---------------------------+------------------+{RESET}")
    print(f"  {GREEN}|{RESET} {BOLD_GREEN}{'Matrícula':<15}{RESET} {GREEN}|{RESET} {BOLD_GREEN}{'Nome do Aluno':<25}{RESET} {GREEN}|{RESET} {BOLD_GREEN}{'Telefone':<16}{RESET} {GREEN}|{RESET}")
    print(f"  {GREEN}+-----------------+---------------------------+------------------+{RESET}")
    for aluno in alunos:
        print(f"  {GREEN}|{RESET} {GREEN}{aluno['matricula']:<15}{RESET} {GREEN}|{RESET} {GREEN}{aluno['nome']:<25}{RESET} {GREEN}|{RESET} {GREEN}{aluno['telefone']:<16}{RESET} {GREEN}|{RESET}")
    print(f"  {GREEN}+-----------------+---------------------------+------------------+{RESET}")

def pesquisar_aluno(alunos):
    limpar_tela()
    exibir_banner("PESQUISAR ALUNO")
    print(f"  {DARK_GREEN}(Digite 'SAIR' para voltar ao menu principal){RESET}\n")
    
    termo = input(f"  {BOLD_GREEN}[?] Digite a matrícula, nome ou telefone:{RESET} ").strip()
    if termo.upper() == "SAIR":
        return False

    if not termo:
        mensagem_erro("O termo de busca não pode ficar em branco!")
        return True

    termo_lower = termo.lower()
    encontrados = []

    for aluno in alunos:
        if (termo_lower in aluno['matricula'].lower() or
            termo_lower in aluno['nome'].lower() or
            termo_lower in aluno['telefone'].lower()):
            encontrados.append(aluno)

    if encontrados:
        print(f"\n  {BOLD_GREEN}Resultado da busca ({len(encontrados)} aluno(s) encontrado(s)):{RESET}\n")
        print(f"  {GREEN}+-----------------+---------------------------+------------------+{RESET}")
        print(f"  {GREEN}|{RESET} {BOLD_GREEN}{'Matrícula':<15}{RESET} {GREEN}|{RESET} {BOLD_GREEN}{'Nome do Aluno':<25}{RESET} {GREEN}|{RESET} {BOLD_GREEN}{'Telefone':<16}{RESET} {GREEN}|{RESET}")
        print(f"  {GREEN}+-----------------+---------------------------+------------------+{RESET}")
        for aluno in encontrados:
            print(f"  {GREEN}|{RESET} {GREEN}{aluno['matricula']:<15}{RESET} {GREEN}|{RESET} {GREEN}{aluno['nome']:<25}{RESET} {GREEN}|{RESET} {GREEN}{aluno['telefone']:<16}{RESET} {GREEN}|{RESET}")
        print(f"  {GREEN}+-----------------+---------------------------+------------------+{RESET}")
        return True
    else:
        mensagem_erro(f"Nenhum aluno foi encontrado com o termo '{termo}'.")
        return True

def remover_aluno(alunos):
    limpar_tela()
    exibir_banner("REMOVER ALUNO")
    print(f"  {DARK_GREEN}(Digite 'SAIR' para voltar ao menu principal){RESET}\n")
    
    matricula = input(f"  {BOLD_GREEN}[-] Digite a matrícula do aluno a remover:{RESET} ").strip()
    if matricula.upper() == "SAIR":
        return False

    if not matricula.isdigit():
        mensagem_erro("A matrícula deve conter apenas números inteiros!")
        return True
    
    for i, aluno in enumerate(alunos):
        if aluno['matricula'] == matricula:
            linha_tracada = "-" * LARGURA_BOX
            print(f"\n  {GREEN}+{linha_tracada}+{RESET}")
            print(f"  {GREEN}|{RESET}{BOLD_GREEN}{'ALUNO SELECIONADO PARA REMOÇÃO':^{LARGURA_BOX}}{RESET}{GREEN}|{RESET}")
            print(f"  {GREEN}+{linha_tracada}+{RESET}")
            print(f"  {GREEN}|{RESET}  {BOLD_GREEN}Matrícula:{RESET} {GREEN}{aluno['matricula']:<45}{RESET}  {GREEN}|{RESET}")
            print(f"  {GREEN}|{RESET}  {BOLD_GREEN}Nome:{RESET}      {GREEN}{aluno['nome']:<45}{RESET}  {GREEN}|{RESET}")
            print(f"  {GREEN}|{RESET}  {BOLD_GREEN}Telefone:{RESET}  {GREEN}{aluno['telefone']:<45}{RESET}  {GREEN}|{RESET}")
            print(f"  {GREEN}+{linha_tracada}+{RESET}\n")
            
            confirma = input(f"  {BOLD_RED}[!] Tem certeza que deseja remover este aluno? (S/N):{RESET} ").strip().upper()
            if confirma in ["S", "SIM"]:
                removido = alunos.pop(i)
                salvar_alunos(alunos)
                mensagem_sucesso(f"Aluno '{removido['nome']}' (Matrícula: {removido['matricula']}) foi removido com sucesso!")
            else:
                mensagem_info("Remoção cancelada pelo usuário.")
            return True
            
    mensagem_erro("Aluno não encontrado para remoção.")
    return True

def main():
    alunos = carregar_alunos()
    
    while True:
        limpar_tela()
        exibir_menu()
        opcao = input(f"\n  {BOLD_GREEN}[>] Escolha uma opção (0-4): {RESET}").strip()
        
        if opcao == "1":
            if cadastrar_aluno(alunos):
                pausar()
        elif opcao == "2":
            listar_alunos(alunos)
            pausar()
        elif opcao == "3":
            if pesquisar_aluno(alunos):
                pausar()
        elif opcao == "4":
            if remover_aluno(alunos):
                pausar()
        elif opcao == "0":
            limpar_tela()
            exibir_banner("ENCERRANDO O SISTEMA")
            print(f"  {BOLD_GREEN}Sistema finalizado com sucesso. Até logo!{RESET}\n")
            time.sleep(1.2)
            sys.exit(0)
        else:
            mensagem_erro("Opção inválida! Escolha um número entre 0 e 4.")
            pausar()

if __name__ == "__main__":
    main()
