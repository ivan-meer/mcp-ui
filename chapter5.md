# Глава 5: Отображение Результатов Анализа в GUI

Мы почти у цели! У нас есть графический интерфейс для выбора папки (Главы 2 и 3) и функции для анализа содержимого этой папки (Глава 4). В этой главе мы соединим эти две части: добавим кнопку "Анализировать", которая запустит наши функции подсчета, и отобразим результаты прямо в окне нашего приложения.

## ➕ Добавление кнопки "Анализировать"

По аналогии с кнопкой "Выбрать папку", нам нужна еще одна кнопка, которая будет запускать процесс анализа.

```python
# ... (код для создания окна root, кнопки btn_select_folder и метки lbl_folder_path) ...

# Кнопка "Анализировать"
btn_analyze = tk.Button(root, text="Анализировать")
btn_analyze.pack(pady=10) # Отступ для красоты

# ... (остальные метки и root.mainloop()) ...
```

Эта кнопка пока ничего не делает, но мы скоро это исправим.

## 📊 Добавление меток (Labels) для результатов

Нам нужно место, где будут отображаться результаты анализа. Для этого мы добавим еще несколько меток (Labels):

*   Одна для общего количества файлов.
*   Одна для количества строк кода Python.
*   Одна для количества строк кода JavaScript.

```python
# ... (код для кнопки btn_analyze) ...

# Метки для отображения результатов анализа
lbl_total_files = tk.Label(root, text="Всего файлов: -")
lbl_total_files.pack(pady=5)

lbl_py_loc = tk.Label(root, text="Строк кода Python: -")
lbl_py_loc.pack(pady=5)

lbl_js_loc = tk.Label(root, text="Строк кода JavaScript: -")
lbl_js_loc.pack(pady=5)

# ... (root.mainloop()) ...
```
Изначально на этих метках будет стоять прочерк (`-`), который мы заменим на реальные цифры после анализа.

## 🧠 Создание функции-обработчика для кнопки "Анализировать" (`analyze_repository_action`)

Это сердце нашей главы. Эта функция будет выполняться, когда пользователь нажмет кнопку "Анализировать".

**Что она должна делать?**

1.  **Проверить, выбрана ли папка:** Прежде чем что-то анализировать, нужно убедиться, что пользователь указал, *что* анализировать. Мы будем использовать нашу глобальную переменную `selected_folder_path` (из Главы 3).
2.  **Если папка не выбрана – сообщить об ошибке:** Мы можем либо изменить текст одной из меток, либо показать всплывающее окно с ошибкой. Для этого хорошо подходит `messagebox` из Tkinter.
3.  **Если папка выбрана – запустить анализ:** Вызвать функции `count_total_files()` и `count_lines_of_code()` (из Главы 4), передав им `selected_folder_path`.
4.  **Отобразить результаты:** Обновить текст наших новых меток (`lbl_total_files`, `lbl_py_loc`, `lbl_js_loc`) полученными данными.

**Импорт `messagebox`:**
Для красивых всплывающих окон с сообщениями нам понадобится модуль `messagebox`. Его нужно импортировать:

```python
import tkinter as tk
from tkinter import filedialog
from tkinter import messagebox # <--- Вот он!
import os # Не забываем про модуль os для функций анализа
```

**Сама функция `analyze_repository_action`:**

```python
# Предполагается, что функции count_total_files и count_lines_of_code
# из Главы 4 уже определены где-то выше в этом же файле.
# И глобальная переменная selected_folder_path также определена.

def analyze_repository_action():
    # 1. Проверяем, выбрана ли папка
    if not selected_folder_path: # Если selected_folder_path пустая
        # 2. Папка не выбрана - показываем ошибку
        messagebox.showerror("Ошибка", "Пожалуйста, сначала выберите папку для анализа!")
        # Очистим предыдущие результаты, если они были
        lbl_total_files.config(text="Всего файлов: -")
        lbl_py_loc.config(text="Строк кода Python: -")
        lbl_js_loc.config(text="Строк кода JavaScript: -")
        return # Выходим из функции, так как анализировать нечего

    # 3. Папка выбрана - приступаем к анализу
    try:
        # Проверяем, существует ли указанный путь и является ли он папкой
        if not os.path.exists(selected_folder_path) or not os.path.isdir(selected_folder_path):
            messagebox.showerror("Ошибка", f"Выбранный путь не существует или не является папкой:\n{selected_folder_path}")
            return

        # Вызываем функции анализа из Главы 4
        total_files_count = count_total_files(selected_folder_path)
        loc_results = count_lines_of_code(selected_folder_path, extensions=['.py', '.js'])

        # 4. Обновляем метки с результатами
        lbl_total_files.config(text=f"Всего файлов: {total_files_count}")
        
        # Используем .get(key, default_value) для словаря loc_results.
        # Это безопасно: если ключа (например, '.py') нет в словаре 
        # (например, в папке нет .py файлов), .get() вернет 0, а не ошибку.
        py_lines = loc_results.get('.py', 0)
        js_lines = loc_results.get('.js', 0)
        
        lbl_py_loc.config(text=f"Строк кода Python: {py_lines}")
        lbl_js_loc.config(text=f"Строк кода JavaScript: {js_lines}")

        # Можно добавить сообщение об успешном завершении
        messagebox.showinfo("Анализ завершен", f"Анализ папки {selected_folder_path} успешно завершен!")

    except Exception as e:
        # Ловим любые другие ошибки, которые могли произойти во время анализа
        messagebox.showerror("Ошибка анализа", f"Произошла ошибка во время анализа:\n{e}")
        lbl_total_files.config(text="Всего файлов: Ошибка")
        lbl_py_loc.config(text="Строк кода Python: Ошибка")
        lbl_js_loc.config(text="Строк кода JavaScript: Ошибка")
```

**Разбор ключевых моментов функции `analyze_repository_action`:**

*   **`if not selected_folder_path:`**: Проверяем, пуста ли наша глобальная переменная. Если да, значит, пользователь еще не выбрал папку.
*   **`messagebox.showerror("Заголовок окна", "Текст сообщения")`**: Эта функция из `tkinter.messagebox` показывает стандартное окно с сообщением об ошибке. У нее есть и другие варианты:
    *   `messagebox.showinfo("Заголовок", "Текст")` - для информационных сообщений.
    *   `messagebox.showwarning("Заголовок", "Текст")` - для предупреждений.
    *   `messagebox.askyesno("Заголовок", "Вопрос?")` - для вопросов Да/Нет (возвращает `True` или `False`).
    И другие. Это очень удобный способ общаться с пользователем.
*   **`return`**: Если папка не выбрана, мы показываем ошибку и сразу выходим из функции с помощью `return`, чтобы не выполнять дальнейший код анализа.
*   **Проверка `os.path.exists()` и `os.path.isdir()`**: Добавлена дополнительная проверка на случай, если путь был выбран, но потом папка была удалена или это вообще не папка.
*   **`total_files_count = count_total_files(selected_folder_path)`**: Вызываем нашу функцию из Главы 4.
*   **`loc_results = count_lines_of_code(...)`**: Вызываем другую нашу функцию. Она вернет словарь, например: ` {'.py': 150, '.js': 230, 'total_processed_files': 5}`.
*   **f-строки (форматированные строки):**
    *   Конструкции вида `f"Всего файлов: {total_files_count}"` называются f-строками. Они позволяют легко вставлять значения переменных прямо в строку. Все, что находится внутри фигурных скобок `{}` в такой строке, будет заменено значением соответствующей переменной. Это очень удобно и делает код чище, чем старые способы форматирования строк.
*   **`loc_results.get('.py', 0)`**:
    *   Метод `.get(key, default_value)` для словарей очень полезен. Он пытается получить значение по ключу `key` (например, `'.py'`).
    *   Если такой ключ в словаре есть, `.get()` вернет его значение.
    *   Если ключа нет (например, в выбранной папке не оказалось файлов с расширением `.py`), то вместо того, чтобы вызывать ошибку `KeyError` (как это сделал бы обычный доступ через квадратные скобки `loc_results['.py']`), метод `.get()` вернет значение, указанное вторым аргументом (в нашем случае `0`). Это избавляет нас от необходимости писать дополнительные проверки `if '.py' in loc_results:`.
*   **`try...except Exception as e:`**: Мы обернули вызовы функций анализа и обновление меток в блок `try...except`. Если во время работы функций `count_total_files` или `count_lines_of_code` (например, из-за проблем с доступом к файлу, очень странной кодировки, которую мы не обработали, или другой непредвиденной ситуации) произойдет ошибка, программа не "упадет", а перехватит эту ошибку. Мы покажем пользователю сообщение об ошибке и запишем "Ошибка" в метки результатов. Переменная `e` будет содержать информацию о самой ошибке.

## 🔗 Связывание функции с кнопкой "Анализировать"

Теперь, когда у нас есть функция `analyze_repository_action`, нам нужно сказать кнопке `btn_analyze`, чтобы она вызывала эту функцию при нажатии. Это делается так же, как и для первой кнопки – через параметр `command`.

```python
# ... (определение функции analyze_repository_action) ...

# ... (создание кнопки btn_analyze) ...
btn_analyze.config(command=analyze_repository_action) # Связываем!
# или можно было сразу при создании:
# btn_analyze = tk.Button(root, text="Анализировать", command=analyze_repository_action)

# ... (остальной код) ...
```
Если вы создали кнопку без `command`, метод `.config()` позволяет добавить или изменить параметры виджета уже после его создания.

## 📜 Полный код примера для этой главы

Давайте соберем все воедино. Ниже представлен полный код нашего приложения, включающий все наработки из предыдущих глав и новую функциональность этой главы.

```python
import tkinter as tk
from tkinter import filedialog, messagebox
import os

# --- Глобальная переменная для хранения пути к выбранной папке ---
selected_folder_path = ""

# --- Функции анализа из Главы 4 ---
def count_total_files(folder_path):
    total_files = 0
    for _, _, filenames in os.walk(folder_path):
        total_files += len(filenames)
    return total_files

def count_lines_of_code(folder_path, extensions=['.py', '.js']):
    loc_counts = {ext: 0 for ext in extensions}
    loc_counts['total_processed_files'] = 0

    for dirpath, _, filenames in os.walk(folder_path):
        for file_name in filenames:
            for ext in extensions:
                if file_name.endswith(ext):
                    loc_counts['total_processed_files'] += 1
                    file_path = os.path.join(dirpath, file_name)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            lines = f.readlines()
                            loc_counts[ext] += len(lines)
                    except UnicodeDecodeError:
                        try:
                            with open(file_path, 'r', encoding='latin-1') as f:
                                lines = f.readlines()
                                loc_counts[ext] += len(lines)
                        except Exception as e_inner:
                             print(f"Не удалось прочитать файл {file_path} и с другими кодировками: {e_inner}")
                    except Exception as e_outer:
                        print(f"Ошибка при обработке файла {file_path}: {e_outer}")
                    break 
    return loc_counts

# --- Функции-обработчики для кнопок GUI ---
def selected_folder_action():
    global selected_folder_path
    folder_path_temp = filedialog.askdirectory()
    if folder_path_temp:
        selected_folder_path = folder_path_temp
        lbl_folder_path.config(text=selected_folder_path)
        # Сбрасываем результаты предыдущего анализа при выборе новой папки
        lbl_total_files.config(text="Всего файлов: -")
        lbl_py_loc.config(text="Строк кода Python: -")
        lbl_js_loc.config(text="Строк кода JavaScript: -")
    else:
        if not selected_folder_path: # Если и до этого ничего не было выбрано
            lbl_folder_path.config(text="Папка так и не была выбрана.")
        # Если папка была выбрана ранее, а пользователь нажал "Отмена",
        # то selected_folder_path и текст метки остаются прежними.

def analyze_repository_action():
    if not selected_folder_path:
        messagebox.showerror("Ошибка", "Пожалуйста, сначала выберите папку для анализа!")
        lbl_total_files.config(text="Всего файлов: -")
        lbl_py_loc.config(text="Строк кода Python: -")
        lbl_js_loc.config(text="Строк кода JavaScript: -")
        return

    if not os.path.exists(selected_folder_path) or not os.path.isdir(selected_folder_path):
        messagebox.showerror("Ошибка", f"Выбранный путь не существует или не является папкой:\n{selected_folder_path}")
        return
        
    try:
        total_files_count = count_total_files(selected_folder_path)
        loc_results = count_lines_of_code(selected_folder_path, extensions=['.py', '.js'])

        lbl_total_files.config(text=f"Всего файлов: {total_files_count}")
        
        py_lines = loc_results.get('.py', 0)
        js_lines = loc_results.get('.js', 0)
        
        lbl_py_loc.config(text=f"Строк кода Python: {py_lines}")
        lbl_js_loc.config(text=f"Строк кода JavaScript: {js_lines}")

        messagebox.showinfo("Анализ завершен", f"Анализ папки '{selected_folder_path}' успешно завершен!")

    except Exception as e:
        messagebox.showerror("Ошибка анализа", f"Произошла ошибка во время анализа:\n{e}")
        lbl_total_files.config(text="Всего файлов: Ошибка")
        lbl_py_loc.config(text="Строк кода Python: Ошибка")
        lbl_js_loc.config(text="Строк кода JavaScript: Ошибка")

# --- Создание главного окна ---
root = tk.Tk()
root.title("Анализатор Кода v0.1")
root.geometry("600x450") # Немного увеличим высоту для новых меток

# --- Виджеты ---

# Выбор папки
btn_select_folder = tk.Button(root, text="1. Выбрать папку для анализа", command=selected_folder_action)
btn_select_folder.pack(pady=10, padx=10, fill=tk.X) # fill=tk.X растянет кнопку по ширине

lbl_folder_path = tk.Label(root, text="Папка не выбрана", relief="sunken", wraplength=580) # relief для стиля, wraplength для переноса
lbl_folder_path.pack(pady=5, padx=10, fill=tk.X)

# Запуск анализа
btn_analyze = tk.Button(root, text="2. Анализировать!", command=analyze_repository_action)
btn_analyze.pack(pady=15, padx=10, fill=tk.X)

# Метки для отображения результатов
lbl_total_files_title = tk.Label(root, text="--- Результаты анализа ---")
lbl_total_files_title.pack(pady=(10,0)) # Отступ только сверху

lbl_total_files = tk.Label(root, text="Всего файлов: -")
lbl_total_files.pack(pady=5)

lbl_py_loc = tk.Label(root, text="Строк кода Python: -")
lbl_py_loc.pack(pady=5)

lbl_js_loc = tk.Label(root, text="Строк кода JavaScript: -")
lbl_js_loc.pack(pady=5)

# --- Запуск главного цикла ---
root.mainloop()
```

**Что нового в полном коде:**
*   Все импорты собраны в начале.
*   Функции анализа `count_total_files` и `count_lines_of_code` включены прямо в этот скрипт для простоты (в более крупных проектах их бы вынесли в отдельные файлы-модули).
*   В функции `selected_folder_action` добавлено сбрасывание текста меток результатов при выборе новой папки. Это логично, так как старые результаты уже неактуальны.
*   Немного изменены тексты кнопок и добавлены мелкие улучшения в `pack()` для виджетов (`fill=tk.X` для растягивания по ширине, `wraplength` для метки пути, `relief` для стиля).
*   Добавлена метка-заголовок "--- Результаты анализа ---" для лучшей визуальной организации.

**Как это должно работать:**
1.  Запусти скрипт. Появится окно "Анализатор Кода v0.1".
2.  Нажми кнопку "1. Выбрать папку для анализа".
3.  Выбери папку, содержащую какие-нибудь файлы `.py` и/или `.js` (и другие файлы тоже). Путь к папке отобразится под кнопкой.
4.  Нажми кнопку "2. Анализировать!".
5.  Если все хорошо, метки "Всего файлов", "Строк кода Python" и "Строк кода JavaScript" обновятся, показав результаты подсчета. Появится сообщение "Анализ завершен".
6.  Если ты не выбрал папку и нажал "Анализировать!", появится окно с ошибкой "Пожалуйста, сначала выберите папку...".
7.  Если во время анализа что-то пойдет не так (например, нет прав на чтение файла), появится окно с ошибкой "Произошла ошибка во время анализа...".

Поздравляю! Ты создал полноценное небольшое GUI-приложение на Python, которое выполняет полезную задачу! Это отличный фундамент для дальнейшего изучения программирования и разработки более сложных инструментов. Ты проделал большую работу, пройдя путь от настройки окружения до работающего прототипа! 🎉
