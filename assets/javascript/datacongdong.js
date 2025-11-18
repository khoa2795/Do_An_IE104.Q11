// ../assets/javascript/datacongdong.js
const CommunityData = (function () {
  const STORAGE_KEY_POSTS = "community_posts";
  const STORAGE_KEY_SAVED = "community_saved_posts";

  // Dữ liệu bài viết mẫu - nhiều hơn để demo phân trang
  const staticPosts = [
    {
      id: "static-1",
      title: "Tôi nên thực hiện chương trình/bài tập nào để rèn luyện sức khỏe?",
      content: "Bạn có thể mắc chương trình hoặc video tập luyện nào phù hợp nhất với mục tiêu và sở thích của mình không? Đây là bài đăng được ghim để các thành viên cộng đồng yêu cầu gợi ý về chương trình và video tập luyện.",
      author: "Văn Thịnh",
      avatar: "https://i.pravatar.cc/48?img=8",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-2",
      title: "Chế độ ăn uống như thế nào là hợp lý?",
      content: "Gần đây mình khá bận rộn, hay bỏ bữa và ăn vặt. Mọi người có thể gợi ý cho mình một thực đơn đơn giản giúp cân bằng dinh dưỡng và phù hợp với người ít thời gian nấu nướng không ạ?",
      author: "Thu Hương",
      avatar: "https://i.pravatar.cc/48?img=9",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-3",
      title: "Mọi người duy trì thói quen tập thể dục mỗi ngày như thế nào?",
      content: "Mình hay bắt đầu tập nhưng dễ bỏ cuộc giữa chừng. Không biết mọi người có bí quyết gì để duy trì thói quen tập luyện đều đặn mà không bị nản không ạ?",
      author: "Minh Tâm",
      avatar: "https://i.pravatar.cc/48?img=10",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-4",
      title: "Có ai bị mất ngủ khi thay đổi thói quen ăn uống không?",
      content: "Sau khi cắt giảm tinh bột và cà phê, mình thấy khó ngủ hơn. Không biết có ai từng gặp trường hợp giống mình và có gợi ý nào giúp cải thiện giấc ngủ không ạ?",
      author: "Hoàng Nam",
      avatar: "https://i.pravatar.cc/48?img=11",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-5",
      title: "Kinh nghiệm chọn giày tập thể dục phù hợp",
      content: "Mình mới bắt đầu tập chạy bộ và không biết nên chọn loại giày nào cho phù hợp. Có ai có kinh nghiệm chia sẻ không ạ?",
      author: "Thanh Mai",
      avatar: "https://i.pravatar.cc/48?img=13",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-6",
      title: "Cách giảm cân lành mạnh cho người làm văn phòng",
      content: "Do tính chất công việc phải ngồi nhiều, mình khó kiểm soát cân nặng. Mọi người có lời khuyên gì không?",
      author: "Quang Huy",
      avatar: "https://i.pravatar.cc/48?img=14",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-7",
      title: "Thực đơn eat clean cho người mới bắt đầu",
      content: "Mình muốn áp dụng eat clean nhưng không biết bắt đầu từ đâu. Ai có thực đơn mẫu không ạ?",
      author: "Ngọc Anh",
      avatar: "https://i.pravatar.cc/48?img=15",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-8",
      title: "Bài tập tại nhà không cần dụng cụ",
      content: "Nhà mình không có nhiều dụng cụ tập, ai có thể chia sẻ bài tập hiệu quả không cần thiết bị không?",
      author: "Trung Kiên",
      avatar: "https://i.pravatar.cc/48?img=16",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-9",
      title: "Cách vượt qua cảm giác thèm ăn vặt",
      content: "Mình rất hay thèm ăn vặt vào buổi tối. Có cách nào để kiểm soát không ạ?",
      author: "Minh Châu",
      avatar: "https://i.pravatar.cc/48?img=17",
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "static-10",
      title: "Kinh nghiệm tập yoga cho người mới",
      content: "Mình muốn tập yoga để giảm stress và tăng sự dẻo dai. Có ai có kinh nghiệm chia sẻ không?",
      author: "Hồng Nhung",
      avatar: "https://i.pravatar.cc/48?img=18",
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Hàm lấy tất cả bài viết (static + user posts)
  function getAllPosts() {
    const userPosts = loadFromStorage(STORAGE_KEY_POSTS, []);
    
    // Kết hợp và sắp xếp theo thời gian (mới nhất lên đầu)
    const allPosts = [...staticPosts, ...userPosts].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return allPosts;
  }

  // Hàm lấy bài viết theo trang (4 bài mỗi trang)
  function getPostsByPage(page = 1, postsPerPage = 4) {
    const allPosts = getAllPosts();
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const posts = allPosts.slice(startIndex, endIndex);

    return {
      posts,
      currentPage: page,
      totalPages,
      totalPosts,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  // Hàm lưu bài viết mới
  function saveNewPost(title, content) {
    try {
      const userPosts = loadFromStorage(STORAGE_KEY_POSTS, []);
      const now = new Date();

      const newPost = {
        id: "user-" + now.getTime(),
        title,
        content,
        author: "Bạn",
        avatar: "https://i.pravatar.cc/48?img=12",
        createdAt: now.toISOString()
      };

      userPosts.push(newPost);
      saveToStorage(STORAGE_KEY_POSTS, userPosts);
      return true;
    } catch (e) {
      console.error("Không thể lưu bài đăng:", e);
      return false;
    }
  }

  // Hàm quản lý trạng thái lưu bài
  function toggleSavePost(postId) {
    let savedIds = loadFromStorage(STORAGE_KEY_SAVED, []);
    
    if (savedIds.includes(postId)) {
      savedIds = savedIds.filter(id => id !== postId);
    } else {
      savedIds.push(postId);
    }
    
    saveToStorage(STORAGE_KEY_SAVED, savedIds);
    return savedIds.includes(postId);
  }

  function getSavedPosts() {
    return loadFromStorage(STORAGE_KEY_SAVED, []);
  }

  // Hàm tiện ích localStorage
  function loadFromStorage(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (e) {
      console.error("Lỗi đọc localStorage:", e);
      return defaultValue;
    }
  }

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Lỗi ghi localStorage:", e);
    }
  }

  // Hàm escape HTML
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Hàm format thời gian
  function formatTimeAgo(isoString) {
    if (!isoString) return "Vừa xong";
    const created = new Date(isoString);
    const now = new Date();
    const diffMs = now - created;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / (3600 * 1000));
    const diffDay = Math.floor(diffMs / (24 * 3600 * 1000));

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return created.toLocaleDateString("vi-VN");
  }

  return {
    getAllPosts,
    getPostsByPage,
    saveNewPost,
    toggleSavePost,
    getSavedPosts,
    escapeHtml,
    formatTimeAgo
  };
})();