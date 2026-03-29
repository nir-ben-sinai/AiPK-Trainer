// הוסף את הבלוק הזה בתוך פונקציית App, מעל ה-useEffect הקיים:

useEffect(() => {
    // מאזין לשינויים במצב ההתחברות (גוגל, לינק, סיסמה)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const { user: authUser } = session;
            
            // בודק אם המשתמש כבר קיים אצלנו בטבלה
            let localUser = DB.users.find(u => u.email === authUser.email);
            
            if (!localUser) {
                // אם זה משתמש חדש מגוגל - יוצר לו פרופיל אוטומטי
                localUser = {
                    id: authUser.id,
                    name: authUser.user_metadata.full_name || authUser.email.split('@')[0],
                    email: authUser.email,
                    role: authUser.email === "admin@aipk.co.il" ? "admin" : "trainee",
                    joinedAt: new Date().toISOString()
                };
                DB.users.push(localUser);
                await supabase.from('app_users').upsert([{ id: localUser.id, data: localUser }]);
            }
            
            setUser(localUser);
            if (localUser.role === "admin") setScreen("admin_upload");
            else setScreen("onboarding");
        }
    });

    return () => subscription.unsubscribe();
}, []);
