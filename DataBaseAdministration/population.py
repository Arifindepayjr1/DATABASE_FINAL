import mysql.connector
from faker import Faker
import random
from time import time

fake = Faker()

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database=""
)
cursor = conn.cursor()

BATCH_SIZE = 1000  # Adjust as needed


# --- USERS
def insert_users(total=1_000):
    used_usernames = set()
    fake.unique.clear()
    for i in range(0, total, BATCH_SIZE):
        batch_size = min(BATCH_SIZE, total - i)
        users = []
        for _ in range(batch_size):
            while True:
                username = fake.unique.user_name() + str(random.randint(1000, 9999))
                if username not in used_usernames:
                    used_usernames.add(username)
                    break
            try:
                users.append((
                    fake.name(),
                    username,
                    fake.unique.email(),
                    fake.sha256(),
                    fake.text(100),
                    fake.image_url(),
                    random.choice(['active', 'inactive', 'banned'])
                ))
            except Exception:
                fake.unique.clear()
        cursor.executemany("""
            INSERT IGNORE INTO users (full_name, username, email, password_hash, bio, profile_pic_url, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, users)
        conn.commit()
        print(f"✅ Inserted users: {i + batch_size}/{total}")


# --- ROLES
def insert_roles():
    roles = ['admin', 'editor', 'author', 'moderator', 'reader']
    cursor.executemany("""
        INSERT IGNORE INTO roles (role_name, description)
        VALUES (%s, %s)
    """, [(r, f"{r} role") for r in roles])
    conn.commit()
    print("✅ Inserted roles.")


# --- USER_ROLES
def insert_user_roles():
    cursor.execute("SELECT user_id FROM users")
    user_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT role_id FROM roles")
    role_ids = [r[0] for r in cursor.fetchall()]

    for i in range(0, len(user_ids), BATCH_SIZE):
        batch_size = min(BATCH_SIZE, len(user_ids) - i)
        pairs = [(uid, random.choice(role_ids)) for uid in user_ids[i:i + batch_size]]
        cursor.executemany("""
            INSERT IGNORE INTO user_roles (user_id, role_id)
            VALUES (%s, %s)
        """, pairs)
        conn.commit()
        print(f"✅ Inserted user_roles: {i + batch_size}/{len(user_ids)}")


# --- CATEGORIES
def insert_categories(n=50):
    categories = [(fake.word() + str(i), fake.text(50)) for i in range(n)]
    cursor.executemany("INSERT INTO categories (name, description) VALUES (%s, %s)", categories)
    conn.commit()
    print(f"✅ Inserted {n} categories.")


# --- POSTS
def insert_posts(total=1_000):
    cursor.execute("SELECT user_id FROM users")
    user_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT category_id FROM categories")
    cat_ids = [r[0] for r in cursor.fetchall()]

    for i in range(0, total, BATCH_SIZE):
        batch_size = min(BATCH_SIZE, total - i)
        posts = [(fake.slug(), random.choice(user_ids), random.choice(cat_ids)) for _ in range(batch_size)]
        cursor.executemany("""
            INSERT INTO posts (slug, author_id, category_id)
            VALUES (%s, %s, %s)
        """, posts)
        conn.commit()
        print(f"✅ Inserted posts: {i + batch_size}/{total}")


# --- POST_VERSIONS
def insert_post_versions():
    cursor.execute("SELECT post_id, author_id FROM posts")
    posts = cursor.fetchall()

    batch = []
    for i, (post_id, author_id) in enumerate(posts):
        batch.append((post_id, 1, fake.sentence(), fake.text(500), author_id))
        if len(batch) >= BATCH_SIZE:
            cursor.executemany("""
                INSERT INTO post_versions (post_id, version_num, title, content, updated_by)
                VALUES (%s, %s, %s, %s, %s)
            """, batch)
            conn.commit()
            print(f"✅ Inserted post_versions: {i + 1}/{len(posts)}")
            batch = []

    if batch:
        cursor.executemany("""
            INSERT INTO post_versions (post_id, version_num, title, content, updated_by)
            VALUES (%s, %s, %s, %s, %s)
        """, batch)
        conn.commit()


# --- COMMENTS
def insert_comments(total=1_000):
    cursor.execute("SELECT post_id FROM posts")
    post_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT user_id FROM users")
    user_ids = [r[0] for r in cursor.fetchall()]

    for i in range(0, total, BATCH_SIZE):
        batch_size = min(BATCH_SIZE, total - i)
        comments = [(random.choice(post_ids), random.choice(user_ids), fake.text(150), True)
                    for _ in range(batch_size)]
        cursor.executemany("""
            INSERT INTO comments (post_id, user_id, content, is_approved)
            VALUES (%s, %s, %s, %s)
        """, comments)
        conn.commit()
        print(f"✅ Inserted comments: {i + batch_size}/{total}")


# --- POST_LIKES
def insert_post_likes(total=1_000):
    cursor.execute("SELECT post_id FROM posts")
    post_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT user_id FROM users")
    user_ids = [r[0] for r in cursor.fetchall()]

    seen = set()
    likes = []

    for _ in range(total * 2):  # Try more to reduce duplicates
        uid = random.choice(user_ids)
        pid = random.choice(post_ids)
        if (uid, pid) not in seen:
            seen.add((uid, pid))
            likes.append((uid, pid))
        if len(likes) >= BATCH_SIZE:
            cursor.executemany("""
                INSERT IGNORE INTO post_likes (user_id, post_id)
                VALUES (%s, %s)
            """, likes[:BATCH_SIZE])
            conn.commit()
            print(f"✅ Inserted post_likes: {len(seen)}/{total}")
            likes = []
        if len(seen) >= total:
            break


# === Run Everything ===
start_time = time()
print("🚀 Inserting users...")
insert_users(1_000)

print("🚀 Inserting roles...")
insert_roles()

print("🚀 Assigning user roles...")
insert_user_roles()

print("🚀 Inserting categories...")
insert_categories(50)

print("🚀 Inserting posts...")
insert_posts(1_000)

print("🚀 Inserting post versions...")
insert_post_versions()

print("🚀 Inserting comments...")
insert_comments(1_000)

print("🚀 Inserting likes...")
insert_post_likes(1_000)

cursor.close()
conn.close()
print(f"✅ All data inserted in {round(time() - start_time, 2)} seconds.")
