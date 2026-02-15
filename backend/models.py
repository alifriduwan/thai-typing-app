from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email         = db.Column(db.String(120), unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, raw): self.password_hash = generate_password_hash(raw)
    def check_password(self, raw): return check_password_hash(self.password_hash, raw)

class SpellingProgress(db.Model):
    __tablename__ = "spelling_progress"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    level = db.Column(db.Integer, nullable=False)
    passed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    attempts = db.Column(db.Integer, nullable=False, default=0)
    __table_args__ = (db.UniqueConstraint("user_id", "level", name="uq_spelling_progress_user_level"),)

class SpellingLevel(db.Model):
    __tablename__ = "spelling_levels"
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.Integer, nullable=False, unique=True, index=True)
    correct_word = db.Column(db.String(100), nullable=False)
    options = db.Column(db.JSON, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class TypingRaceLevel(db.Model):
    __tablename__ = "typing_race_levels"
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.Integer, nullable=False, unique=True, index=True)
    text = db.Column(db.Text, nullable=False)
    bot_wpm = db.Column(db.Integer, nullable=False, default=30)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class TypingRaceProgress(db.Model):
    __tablename__ = "typing_race_progress"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    level = db.Column(db.Integer, nullable=False)
    passed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    accuracy = db.Column(db.Integer, nullable=True)
    winner = db.Column(db.String(10), nullable=True) 
    attempts = db.Column(db.Integer, nullable=False, default=0)
    __table_args__ = (db.UniqueConstraint("user_id", "level", name="uq_typingrace_progress_user_level"),)

class TypingFallLevel(db.Model):
    __tablename__ = "typing_fall_levels"
    id               = db.Column(db.Integer, primary_key=True)
    level            = db.Column(db.Integer, nullable=False, unique=True, index=True)
    fall_speed       = db.Column(db.Float, nullable=False)
    spawn_interval_ms= db.Column(db.Integer, nullable=False)
    max_concurrent   = db.Column(db.Integer, nullable=False)
    target_words     = db.Column(db.Integer, nullable=False)
    word_pool        = db.Column(db.JSON, nullable=False)
    is_active        = db.Column(db.Boolean, nullable=False, default=True)
    created_at       = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class TypingFallProgress(db.Model):
    __tablename__ = "typing_fall_progress"
    id        = db.Column(db.Integer, primary_key=True)
    user_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    level     = db.Column(db.Integer, nullable=False)
    passed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    attempts  = db.Column(db.Integer, nullable=False, default=0)
    __table_args__ = (db.UniqueConstraint("user_id", "level", name="uq_typingfall_progress_user_level"),)


class TypingText(db.Model):
    __tablename__ = "typing_texts"
    id        = db.Column(db.Integer, primary_key=True)
    level     = db.Column(db.String(16), nullable=False, index=True)          
    time_sec  = db.Column(db.Integer, nullable=False, index=True)            
    text      = db.Column(db.Text, nullable=False)                           
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at= db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        db.Index("idx_typing_text_level_time", "level", "time_sec"),
    )

class TypingTestSession(db.Model):
    __tablename__ = "typing_test_sessions"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    level         = db.Column(db.String(16), nullable=False, index=True)   
    time_sec      = db.Column(db.Integer, nullable=False)                 
    text_id       = db.Column(db.Integer, nullable=True)                   
    wpm           = db.Column(db.Integer, nullable=False)
    accuracy      = db.Column(db.Integer, nullable=False)                 
    correct_chars = db.Column(db.Integer, nullable=False, default=0)
    total_chars   = db.Column(db.Integer, nullable=False, default=0)
    created_at    = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    __table_args__ = (
        db.Index("idx_ttyping_sessions_user_day", "user_id", "created_at"),
    )
    
class LessonGroup(db.Model):
    __tablename__ = "lesson_groups"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)

    lessons = db.relationship("Lesson", backref="group", cascade="all, delete-orphan")


class Lesson(db.Model):
    __tablename__ = "lessons"
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("lesson_groups.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)

    left_hand_img = db.Column(db.String(255), nullable=True)
    right_hand_img = db.Column(db.String(255), nullable=True)

    steps = db.relationship("LessonStep", backref="lesson", cascade="all, delete-orphan")


class LessonStep(db.Model):
    __tablename__ = "lesson_steps"
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False, index=True)
    order = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(32), nullable=False)  
    config = db.Column(db.JSON, nullable=False)
    success_to_continue = db.Column(db.Boolean, default=True)


class LessonProgress(db.Model):
    __tablename__ = "lesson_progress"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    lesson = db.relationship("Lesson", backref="progress_records")


class TypingLesson(db.Model):
    __tablename__ = "typing_lessons"

    id = db.Column(db.Integer, primary_key=True)
    lesson_number = db.Column(db.Integer, unique=True, nullable=False, index=True)
    title = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    levels = db.relationship("TypingLevel", backref="lesson", lazy=True)

    def __repr__(self):
        return f"<TypingLesson {self.lesson_number}>"


class TypingLevel(db.Model):
    __tablename__ = "typing_levels"

    id = db.Column(db.Integer, primary_key=True)

    lesson_id = db.Column(
        db.Integer,
        db.ForeignKey("typing_lessons.id"),
        nullable=False,
        index=True
    )

    level_index = db.Column(db.Integer, nullable=False) 


    global_index = db.Column(db.Integer, nullable=False, unique=True, index=True)

    raw_chars = db.Column(db.JSON, nullable=True)
    display_chars = db.Column(db.JSON, nullable=True)
    has_hand_images = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("lesson_id", "level_index", name="uq_lesson_level_idx"),
    )

    def __repr__(self):
        return f"<TypingLevel L{self.lesson_id}-Step{self.level_index} GI={self.global_index}>"



class TypingProgress(db.Model):
    __tablename__ = "typing_progress"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    lesson_id = db.Column(
        db.Integer,
        db.ForeignKey("typing_lessons.id"),
        nullable=False,
        index=True
    )

    level_index = db.Column(db.Integer, nullable=False)

    global_index = db.Column(db.Integer, nullable=False, index=True)

    wpm = db.Column(db.Integer, nullable=False)
    accuracy = db.Column(db.Integer, nullable=False)
    mistakes = db.Column(db.Integer, nullable=False, default=0)
    stars = db.Column(db.Integer, nullable=False, default=1)
    attempts = db.Column(db.Integer, nullable=False, default=1)
    completed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "global_index", name="uq_progress_global_user"),
    )

    def __repr__(self):
        return f"<TypingProgress U{self.user_id}-GI{self.global_index}>"